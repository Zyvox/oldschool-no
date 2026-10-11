/**
 * Tiny, dependency-free bundlers for this repo's own sources.
 *
 * CSS: inlines `@import "x.css";` recursively and rewrites relative url()s so
 *      they resolve from the output file's directory.
 * JS:  wraps each ES module in a factory and links them with a small
 *      require() shim → one classic script (IIFE) that works from file:// and
 *      without type="module". Supported syntax (keep src/js to this subset):
 *        import { a, b as c } from './x.js';
 *        export function f() {}   export async function f() {}
 *        export const x = …;      export class C {}
 *        export { a, b as c };
 *      No default exports, no circular imports, no mutable exported bindings.
 */
import fs from 'node:fs';
import path from 'node:path';

/* ---------------------------------------------------------------------------
 * CSS
 * ------------------------------------------------------------------------ */

export function bundleCss(entry, outFile) {
  const seen = new Set();
  const outDir = path.dirname(outFile);

  const visit = (file) => {
    const abs = path.resolve(file);
    if (seen.has(abs)) return '';
    seen.add(abs);
    let src = fs.readFileSync(abs, 'utf8');
    const imports = [];
    src = src.replace(/@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?\s*;/g, (_, spec) => {
      imports.push(path.resolve(path.dirname(abs), spec));
      return `/*__IMPORT_${imports.length - 1}__*/`;
    });
    src = src.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (match, _q, url) => {
      if (/^(data:|https?:|\/\/|\/|#)/.test(url)) return match;
      const target = path.resolve(path.dirname(abs), url);
      return `url("${path.relative(outDir, target).split(path.sep).join('/')}")`;
    });
    return src.replace(/\/\*__IMPORT_(\d+)__\*\//g, (_, i) => visit(imports[Number(i)]));
  };

  return visit(entry);
}

/**
 * Small, safe minifier for our own CSS: strips comments and whitespace,
 * shortens `0.5` to `.5`, and merges consecutive top-level blocks of the same
 * cascade layer (every component file opens its own `@layer os.components`).
 * Strings (data URIs, `content`) are protected throughout.
 */
export function minifyCss(css) {
  const keep = [];
  const stash = (m) => `\u0000${keep.push(m) - 1}\u0000`;
  let out = css
    .replace(/\/\*![\s\S]*?\*\//g, (m) => stash(`${m}\n`))
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, stash)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/\s*>\s*(?=[^{}]*\{)/g, '>')
    .replace(/([{;(]--?[\w-]+|[{;]\s*[a-z-]+|\((?:min|max)-[a-z-]+|\([a-z-]+):\s+/g, '$1:')
    .replace(/([\s:,(/])(-?)0\.(\d)/g, '$1$2.$3')
    .replace(/;}/g, '}')
    .trim();
  out = mergeLayers(out);
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[Number(i)]);
}

/** Merge adjacent top-level `@layer x{…}` blocks with the same name. */
function mergeLayers(css) {
  const chunks = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i += 1) {
    const c = css[i];
    if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) { chunks.push(css.slice(start, i + 1)); start = i + 1; }
    } else if (c === ';' && depth === 0) { chunks.push(css.slice(start, i + 1)); start = i + 1; }
  }
  if (start < css.length) chunks.push(css.slice(start));
  const merged = [];
  for (const chunk of chunks) {
    const head = chunk.match(/^\s*(@layer [\w.-]+)\{/);
    const prev = merged[merged.length - 1];
    const prevHead = prev?.match(/^\s*(@layer [\w.-]+)\{/);
    if (head && prevHead && head[1] === prevHead[1]) {
      merged[merged.length - 1] = prev.slice(0, -1) + chunk.slice(head[0].length);
    } else merged.push(chunk);
  }
  return merged.join('');
}

/* ---------------------------------------------------------------------------
 * JS
 * ------------------------------------------------------------------------ */

function transformModule(source, id) {
  const deps = [];
  const exported = [];
  let body = source;

  body = body.replace(/^import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"];?\s*$/gm, (_, names, spec) => {
    const depId = path.posix.normalize(path.posix.join(path.posix.dirname(id), spec));
    deps.push(depId);
    const bindings = names.split(',').map((n) => n.trim()).filter(Boolean)
      .map((n) => n.replace(/^([\w$]+)\s+as\s+([\w$]+)$/, '$1: $2'));
    return `const { ${bindings.join(', ')} } = __require(${JSON.stringify(depId)});`;
  });
  if (/^\s*import\s/m.test(body)) throw new Error(`${id}: unsupported import syntax`);

  body = body.replace(/^export\s+((?:async\s+)?function\*?|const|let|class)\s+([\w$]+)/gm, (_, kind, name) => {
    exported.push([name, name]);
    return `${kind} ${name}`;
  });
  body = body.replace(/^export\s*\{([^}]*)\};?\s*$/gm, (_, names) => {
    names.split(',').map((n) => n.trim()).filter(Boolean).forEach((n) => {
      const m = n.match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/);
      exported.push([m[1], m[2] ?? m[1]]);
    });
    return '';
  });
  if (/^\s*export\s/m.test(body)) throw new Error(`${id}: unsupported export syntax`);

  const assign = exported.map(([local, name]) => `  __exports.${name} = ${local};`).join('\n');
  return { deps, code: `__define(${JSON.stringify(id)}, function (__require, __exports) {\n${body.trim()}\n${assign}\n});` };
}

export function bundleJs(srcDir, entryId, { banner = '', globalName }) {
  const modules = new Map();
  const order = [];
  const visit = (id, stack = []) => {
    if (stack.includes(id)) throw new Error(`Circular import: ${[...stack, id].join(' → ')}`);
    if (modules.has(id)) return;
    const source = fs.readFileSync(path.join(srcDir, id), 'utf8');
    const mod = transformModule(source, id);
    modules.set(id, mod);
    mod.deps.forEach((dep) => visit(dep, [...stack, id]));
    order.push(id);
  };
  visit(entryId);

  return `${banner}(function () {
'use strict';
var __factories = {}, __cache = {};
function __define(id, factory) { __factories[id] = factory; }
function __require(id) {
  if (__cache[id]) return __cache[id];
  var exports = (__cache[id] = {});
  __factories[id](__require, exports);
  return exports;
}
${order.map((id) => modules.get(id).code).join('\n\n')}

window.${globalName} = __require(${JSON.stringify(entryId)});
})();
`;
}

/**
 * Conservative JS minifier for the bundled output: strips comments, indentation
 * and blank lines, keeps line breaks (so automatic semicolon insertion is never
 * relied on differently). Strings and template literals are protected; src/js
 * must not contain regex literals with quotes or comment markers in them.
 */
export function minifyJs(js) {
  const keep = [];
  const stash = (m) => `\u0000${keep.push(m) - 1}\u0000`;
  return js
    .replace(/\/\*![\s\S]*?\*\//g, (m) => stash(`${m}\n`))
    .replace(/`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, stash)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[\s;{}(),])\/\/.*$/gm, '$1')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .replace(/[ \t]*([=:,;{}()[\]<>+\-*/?|&!])[ \t]*/g, '$1')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => keep[Number(i)]);
}

/* ---------------------------------------------------------------------------
 * Icons
 * ------------------------------------------------------------------------ */

export function buildSprite(iconDir, prefix, banner) {
  const files = fs.readdirSync(iconDir).filter((f) => f.endsWith('.svg')).sort();
  const symbols = files.map((file) => {
    const svg = fs.readFileSync(path.join(iconDir, file), 'utf8');
    const inner = svg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>[\s\S]*$/, '')
      .replace(/\s*\n\s*/g, '')
      .replace(/\s+\/>/g, '/>');
    return `<symbol id="${prefix}${file.replace('.svg', '')}" viewBox="0 0 24 24">${inner}</symbol>`;
  });
  return {
    names: files.map((f) => f.replace('.svg', '')),
    svg: `<svg xmlns="http://www.w3.org/2000/svg">\n<!-- ${banner} -->\n${symbols.join('\n')}\n</svg>\n`,
  };
}

/* ---------------------------------------------------------------------------
 * Files
 * ------------------------------------------------------------------------ */

export function write(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const previous = fs.existsSync(file) ? fs.readFileSync(file) : null;
  const next = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
  if (previous && previous.equals(next)) return false;
  fs.writeFileSync(file, next);
  return true;
}

export function copyDir(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest, filter);
    else if (filter(src)) write(dest, fs.readFileSync(src));
  }
}
