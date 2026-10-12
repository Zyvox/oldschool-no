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
  { name: 'detail-desktop', page: 'detail', width: 1280, height: 900 },
  { name: 'detail-mobile', page: 'detail', width: 390, height: 844, scale: 2 },
  { name: 'detail-dark', page: 'detail', width: 1280, height: 900, mode: 'dark' },
  { name: 'detail-retro', page: 'detail', width: 1280, height: 900, theme: 'retro' },
  { name: 'jobs-desktop', page: 'jobs', width: 1440, height: 760 },
  { name: 'jobs-mobile', page: 'jobs', width: 390, height: 844, scale: 2 },
  { name: 'portal-desktop', page: 'portal', width: 1280, height: 900 },
  { name: 'search-desktop', page: 'search', width: 1280, height: 900 },
  { name: 'app-desktop', page: 'app', width: 1280, height: 900 },
  { name: 'article-desktop', page: 'article', width: 1280, height: 900, theme: 'retro' },
  { name: 'themes', page: 'themes', width: 1280, height: 900, scrollTo: '#h-compare' },
  { name: 'accent-recipes', page: 'themes', width: 1280, height: 900, element: '#recipes' },
  { name: 'accent-playground', page: 'themes', width: 1280, height: 900, element: '#h-accent', parent: true, click: '#accent-presets [data-hex="#2f6b3f"]' },
  { name: 'devices', page: 'preview', width: 1440, height: 800, wait: 2500 },
];

const out = path.join(root, 'screenshots');
fs.mkdirSync(out, { recursive: true });
const { server, url } = await startServer(root);
const browser = await chromium.launch();
for (const s of shots) {
  const context = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.scale ?? 1, reducedMotion: 'reduce' });
  await context.addInitScript((p) => localStorage.setItem('os-prefs', JSON.stringify(p)), { theme: s.theme ?? 'standard', mode: s.mode ?? 'light', density: s.density ?? 'standard' });
  const page = await context.newPage();
  await page.goto(`${url}/site/${s.page}.html`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  if (s.scrollTo) await page.evaluate((sel) => document.querySelector(sel).scrollIntoView(), s.scrollTo);
  if (s.click) await page.click(s.click);
  await page.waitForTimeout(s.wait ?? 300);
  const file = path.join(out, `${s.name}.png`);
  if (s.element) {
    const target = page.locator(s.element);
    await (s.parent ? target.locator('xpath=ancestor::section[1]') : target).screenshot({ path: file });
  } else await page.screenshot({ path: file });
  console.log(`  ✓ screenshots/${s.name}.png`);
  await context.close();
}
await browser.close();
server.close();
