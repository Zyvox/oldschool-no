#!/usr/bin/env node
/**
 * Dev server — zero dependencies.
 *  · serves the repository root (open http://localhost:5180/site/)
 *  · rebuilds when tokens/ or src/ change
 *  · live-reloads open pages (HTML, CSS, JS, SVG changes)
 *
 * Usage: node scripts/serve.mjs [--port 5180] [--no-watch]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { build, root } from './build.mjs';

const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || Number(process.env.PORT) || 5180;
const watch = !args.includes('--no-watch');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
};

const clients = new Set();
const RELOAD = `<script>(()=>{const s=new EventSource('/__reload');s.onmessage=()=>location.reload();})();</script>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (url.pathname === '/') {
    res.writeHead(302, { Location: '/site/' });
    res.end();
    return;
  }
  let file = path.join(root, decodeURIComponent(url.pathname));
  if (!file.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end(`Not found: ${url.pathname}`);
    return;
  }
  const ext = path.extname(file);
  const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-store' };
  if (ext === '.html' && watch) {
    const html = fs.readFileSync(file, 'utf8').replace('</body>', `${RELOAD}</body>`);
    res.writeHead(200, headers).end(html);
    return;
  }
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
});

function reload() {
  for (const client of clients) client.write('data: reload\n\n');
}

if (watch) {
  let timer = null;
  const schedule = (rebuild) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (rebuild) {
        try {
          build({ quiet: true });
        } catch (error) {
          console.error(`✗ build failed: ${error.message}`);
          return;
        }
      }
      reload();
    }, 80);
  };
  for (const dir of ['tokens', 'src']) {
    fs.watch(path.join(root, dir), { recursive: true }, (_event, name) => {
      if (name && !name.includes('tokens/palette.css') && !String(name).startsWith('css/tokens')) schedule(true);
    });
  }
  fs.watch(path.join(root, 'site'), { recursive: true }, (_event, name) => {
    if (name && !String(name).includes('generated')) schedule(false);
  });
}

build({ quiet: true });
server.listen(port, () => {
  console.log(`Oldschool dev server → http://localhost:${port}/site/`);
  if (watch) console.log('Watching tokens/, src/ and site/ — pages reload on change.');
});
