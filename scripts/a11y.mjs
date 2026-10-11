#!/usr/bin/env node
/**
 * Accessibility audit: axe-core (WCAG 2.0–2.2 A/AA rules) on every showcase
 * page, in several themes, modes and viewports. Also fails on console errors.
 *
 * Needs the dev dependencies:  npm install  (and, outside this repo's CI
 * container, `npx playwright install chromium` once).
 *
 * Usage: node scripts/a11y.mjs [--quick]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { startServer } from './lib/static-server.mjs';
import { root } from './build.mjs';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const quick = process.argv.includes('--quick');

const pages = fs.readdirSync(path.join(root, 'site')).filter((f) => f.endsWith('.html'));
const variants = quick
  ? [{ theme: 'retro', mode: 'light', width: 1280 }]
  : [
    { theme: 'retro', mode: 'light', width: 1280 },
    { theme: 'retro', mode: 'dark', width: 1280 },
    { theme: 'retro', mode: 'light', width: 390 },
    { theme: 'retro', mode: 'light', width: 1280, density: 'compact' },
    { theme: 'standard', mode: 'light', width: 1280 },
    { theme: 'standard', mode: 'dark', width: 390 },
    { theme: 'standard', mode: 'light', width: 1280, density: 'comfortable', width_: 'wide' },
    { theme: 'retro', mode: 'light', width: 1280, contrast: true },
  ];

const { server, url } = await startServer(root);
const browser = await chromium.launch();
let problems = 0;

for (const variant of variants) {
  const context = await browser.newContext({ viewport: { width: variant.width, height: 900 }, reducedMotion: 'reduce', contrast: variant.contrast ? 'more' : 'no-preference' });
  await context.addInitScript((prefs) => localStorage.setItem('os-prefs', JSON.stringify(prefs)), { theme: variant.theme, mode: variant.mode, density: variant.density ?? 'standard', width: variant.width_ ?? 'classic' });
  for (const file of pages) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${url}/site/${file}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(() => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      rules: { region: { enabled: false } },
    }));
    const label = `${file} [${variant.theme}/${variant.mode}${variant.density ? `/${variant.density}` : ''}${variant.width_ ? `/${variant.width_}` : ''}${variant.contrast ? '/more-contrast' : ''} @${variant.width}]`;
    if (!result.violations.length && !errors.length) {
      console.log(`  ✓ ${label}`);
    } else {
      for (const v of result.violations) {
        problems += 1;
        console.log(`  ✗ ${label} ${v.id} (${v.impact}): ${v.help}`);
        v.nodes.slice(0, 4).forEach((n) => console.log(`      ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`));
      }
      errors.forEach((e) => { problems += 1; console.log(`  ✗ ${label} console: ${e}`); });
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
server.close();
console.log(problems ? `\n${problems} accessibility problem(s).` : '\nNo accessibility violations found.');
process.exitCode = problems ? 1 : 0;
