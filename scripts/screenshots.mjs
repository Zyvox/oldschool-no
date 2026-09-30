#!/usr/bin/env node
/**
 * Regenerates the README screenshots in screenshots/.
 * Usage: node scripts/screenshots.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startServer } from './lib/static-server.mjs';
import { root } from './build.mjs';

const shots = [
  { name: 'listing-desktop', page: 'listing', width: 1280, height: 900 },
  { name: 'listing-mobile', page: 'listing', width: 390, height: 844, scale: 2 },
  { name: 'listing-dark', page: 'listing', width: 1280, height: 900, mode: 'dark' },
  { name: 'listing-retro', page: 'listing', width: 1280, height: 900, theme: 'retro' },
  { name: 'search-desktop', page: 'search', width: 1280, height: 900, theme: 'furu' },
  { name: 'themes', page: 'themes', width: 1280, height: 900, scrollTo: '#theme-gallery' },
  { name: 'devices', page: 'preview', width: 1440, height: 800, wait: 2500 },
];

const out = path.join(root, 'screenshots');
fs.mkdirSync(out, { recursive: true });
const { server, url } = await startServer(root);
const browser = await chromium.launch();
for (const s of shots) {
  const context = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.scale ?? 1, reducedMotion: 'reduce' });
  await context.addInitScript((p) => localStorage.setItem('os-prefs', JSON.stringify(p)), { theme: s.theme ?? 'fjord', mode: s.mode ?? 'light' });
  const page = await context.newPage();
  await page.goto(`${url}/site/${s.page}.html`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  if (s.scrollTo) await page.evaluate((sel) => document.querySelector(sel).scrollIntoView(), s.scrollTo);
  await page.waitForTimeout(s.wait ?? 300);
  await page.screenshot({ path: path.join(out, `${s.name}.png`) });
  console.log(`  ✓ screenshots/${s.name}.png`);
  await context.close();
}
await browser.close();
server.close();
