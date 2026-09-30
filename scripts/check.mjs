#!/usr/bin/env node
/**
 * Static checks — zero dependencies, fast, run in CI.
 *
 *  1. Contrast   every semantic pair in tokens/semantic.mjs × every theme × light/dark
 *  2. Tokens     every var(--os-…) used in src/css and site/ is defined somewhere
 *  3. Classes    every os-* class used in site/*.html exists in the CSS
 *  4. HTML       unique ids, alt on every <img>, in-page links and aria refs resolve,
 *                lang on <html>, one <h1> per page
 *  5. Build      generated files are up to date with tokens/ (run `npm run build`)
 *
 * Exit code 1 if anything fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildPalette, checkContrast, themes } from './lib/tokens.mjs';
import { root } from './build.mjs';

const r = (...p) => path.join(root, ...p);
let failures = 0;
const fail = (msg) => { failures += 1; console.log(`  ✗ ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);
const walk = (dir, ext) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name), ext) : e.name.endsWith(ext) ? [path.join(dir, e.name)] : []);

/* 1 · Contrast ------------------------------------------------------------ */
console.log('Contrast (WCAG 2.x)');
const pal = buildPalette();
let pairs = 0;
for (const theme of Object.keys(themes)) {
  for (const mode of ['light', 'dark']) {
    for (const row of checkContrast(pal, theme, mode)) {
      pairs += 1;
      if (!row.pass) fail(`${theme}/${mode}: ${row.fg} on ${row.bg} = ${row.ratio.toFixed(2)} (needs ${row.min}) ${row.fgValue} / ${row.bgValue}`);
    }
  }
}
ok(`${pairs} pairs across ${Object.keys(themes).length} themes × 2 modes`);

/* 2 · Token references ---------------------------------------------------- */
console.log('Token references');
const cssFiles = [...walk(r('src/css'), '.css'), ...walk(r('site/assets'), '.css')];
const jsFiles = [...walk(r('site/assets'), '.js'), ...walk(r('src/js'), '.js')].filter((f) => !f.includes('generated'));
const htmlFiles = walk(r('site'), '.html');
const defined = new Set();
const used = new Map();
for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  for (const m of css.matchAll(/(--os-[\w-]+)\s*:/g)) defined.add(m[1]);
}
// Theme generator + inline styles also define --os-accent/neutral ramps (already in themes.css).
for (const file of [...cssFiles, ...htmlFiles, ...jsFiles]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/var\((--os-[\w-]+)(\s*,)?/g)) {
    if (m[2]) continue; // has a fallback
    if (/-$/.test(m[1])) continue; // built dynamically in JS
    if (!used.has(m[1])) used.set(m[1], path.relative(root, file));
  }
  for (const m of text.matchAll(/style="([^"]*)"/g)) {
    for (const d of m[1].matchAll(/(--os-[\w-]+)\s*:/g)) defined.add(d[1]);
  }
}
const missing = [...used].filter(([name]) => !defined.has(name));
missing.forEach(([name, file]) => fail(`${name} used in ${file} but never defined`));
if (!missing.length) ok(`${used.size} custom properties used, all defined (${defined.size} defined)`);

/* 3 · Classes ------------------------------------------------------------- */
console.log('Component classes');
const allCss = cssFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const cssClasses = new Set([...allCss.matchAll(/\.(os-[\w-]+)/g)].map((m) => m[1]));
const jsText = [...walk(r('src/js'), '.js'), ...walk(r('site/assets'), '.js')].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const unknown = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    for (const cls of m[1].split(/\s+/)) {
      if (cls.startsWith('os-') && !cssClasses.has(cls) && !unknown.has(cls)) unknown.set(cls, path.relative(root, file));
    }
  }
}
for (const m of jsText.matchAll(/['"`]((?:[\w-]+\s)*os-[\w-]+(?:\s[\w-]+)*)['"`]/g)) {
  for (const cls of m[1].split(/\s+/)) {
    if (cls.startsWith('os-') && !cls.startsWith('os-prefs') && !cls.startsWith('os-toggles') && !cssClasses.has(cls) && !unknown.has(cls) && /^[a-z0-9-_]+$/.test(cls) && !cls.endsWith('-')) {
      unknown.set(cls, 'src/js');
    }
  }
}
const allowedUnstyled = new Set(['os-js']);
[...unknown].filter(([c]) => !allowedUnstyled.has(c)).forEach(([cls, file]) => fail(`.${cls} used in ${file} but not styled anywhere`));
if (![...unknown].filter(([c]) => !allowedUnstyled.has(c)).length) ok(`${cssClasses.size} os-* classes; every class used in markup exists`);

/* 4 · HTML hygiene -------------------------------------------------------- */
console.log('HTML');
for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  dupes.forEach((id) => fail(`${rel}: duplicate id "${id}"`));
  const idSet = new Set(ids);
  for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) fail(`${rel}: <img> without alt: ${m[0].slice(0, 80)}`);
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!idSet.has(m[1])) fail(`${rel}: link to missing #${m[1]}`);
  for (const m of html.matchAll(/(?:aria-labelledby|aria-describedby|aria-controls|popovertarget|for|data-os-dialog)="([^"]+)"/g)) {
    for (const id of m[1].split(/\s+/)) if (!idSet.has(id) && !html.includes(`id="${id}"`) && !/\$\{/.test(id)) fail(`${rel}: reference to missing id "${id}"`);
  }
  if (!/<html[^>]*\blang="/.test(html)) fail(`${rel}: <html> has no lang`);
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) fail(`${rel}: ${h1} <h1> elements (expected 1)`);
  for (const m of html.matchAll(/href="\.\.\/dist\/icons\.svg#os-([\w-]+)"/g)) {
    if (!fs.existsSync(r('src/icons', `${m[1]}.svg`))) fail(`${rel}: icon "${m[1]}" is not in src/icons`);
  }
}
ok(`${htmlFiles.length} pages checked`);

/* 5 · Generated files fresh ----------------------------------------------- */
console.log('Generated files');
const generated = ['dist', 'src/css/tokens', 'docs/tokens.md', 'docs/components.md', 'site/assets/generated']
  .flatMap((p) => (fs.statSync(r(p)).isDirectory() ? walk(r(p), '') : [r(p)]));
const snapshot = () => generated.map((f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '')).join('\u0000');
const before = snapshot();
execFileSync(process.execPath, [r('scripts/build.mjs'), '--quiet'], { cwd: root });
if (snapshot() !== before) fail('generated files were stale — they are rebuilt now; commit the result');
else ok('dist/ and generated token files match the sources');

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
