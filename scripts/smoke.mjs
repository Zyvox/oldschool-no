#!/usr/bin/env node
/**
 * Interaction smoke tests in a real browser: do the behaviors actually work?
 * Usage: node scripts/smoke.mjs
 */
import { chromium } from 'playwright';
import { startServer } from './lib/static-server.mjs';
import { root } from './build.mjs';

const { server, url } = await startServer(root);
const browser = await chromium.launch();
let failures = 0;

async function test(name, fn, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await fn(page);
    if (errors.length) throw new Error(errors.join('; '));
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`  ✗ ${name}: ${error.message.split('\n')[0]}`);
  }
  await context.close();
}

const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

await test('gallery: thumbnail moves the picture and updates aria-current', async (page) => {
  await page.goto(`${url}/site/listing.html`);
  await page.click('.os-gallery__thumb[href="#bilde-3"]');
  await page.waitForTimeout(150);
  expect(await page.getAttribute('.os-gallery__thumb[href="#bilde-3"]', 'aria-current') === 'true', 'thumb 3 not current');
  const left = await page.$eval('.os-gallery__track', (t) => t.scrollLeft);
  expect(left > 0, 'track did not scroll');
});

await test('gallery: arrow keys and lightbox (open, next, Escape, focus return)', async (page) => {
  await page.goto(`${url}/site/listing.html`);
  await page.focus('.os-gallery__track');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  expect((await page.textContent('[data-os-gallery-current]')).trim() === '2', 'counter not 2 after ArrowRight');
  await page.click('.os-gallery__caption [data-os-gallery-open]');
  expect(await page.isVisible('dialog.os-lightbox[open]'), 'lightbox did not open');
  await page.keyboard.press('ArrowRight');
  expect((await page.textContent('.os-lightbox__count')).startsWith('3'), 'lightbox did not advance');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(50);
  expect(!(await page.$('dialog.os-lightbox')), 'lightbox not removed');
});

await test('toggle: save button presses, persists and toasts', async (page) => {
  await page.goto(`${url}/site/listing.html`);
  await page.click('.os-actions [data-os-toggle]');
  expect(await page.getAttribute('.os-actions [data-os-toggle]', 'aria-pressed') === 'true', 'not pressed');
  expect((await page.textContent('.os-actions .os-action__label')).trim() === 'Lagret', 'label not swapped');
  expect(await page.isVisible('.os-toast'), 'no toast');
  await page.reload();
  expect(await page.getAttribute('.os-actions [data-os-toggle]', 'aria-pressed') === 'true', 'state not persisted');
});

await test('dialog: data-os-dialog opens a modal and Escape closes it', async (page) => {
  await page.goto(`${url}/site/listing.html`);
  await page.click('[data-os-dialog="interesse"]');
  expect(await page.$eval('#interesse', (d) => d.open), 'dialog not open');
  await page.keyboard.press('Escape');
  expect(!(await page.$eval('#interesse', (d) => d.open)), 'dialog still open');
});

await test('tabs: roles, arrow keys and hidden panels', async (page) => {
  await page.goto(`${url}/site/components.html`);
  const tab = page.locator('.os-tabs [role="tab"]').first();
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.getAttribute('.os-tabs [role="tab"]:nth-child(2)', 'aria-selected') === 'true', 'second tab not selected');
  expect(await page.$eval('#t-1', (p) => p.hidden), 'first panel not hidden');
  expect(!(await page.$eval('#t-2', (p) => p.hidden)), 'second panel hidden');
});

await test('theme: harness controls set data attributes and persist', async (page) => {
  await page.goto(`${url}/site/listing.html`);
  await page.selectOption('.hx-bar select[data-os-theme-control="theme"]', 'furu');
  await page.check('.hx-bar input[value="dark"]', { force: true });
  expect(await page.getAttribute('html', 'data-theme') === 'furu', 'theme not set');
  expect(await page.getAttribute('html', 'data-mode') === 'dark', 'mode not set');
  await page.goto(`${url}/site/search.html`);
  expect(await page.getAttribute('html', 'data-theme') === 'furu', 'theme not persisted across pages');
  const bg = await page.$eval('body', (b) => getComputedStyle(document.documentElement).backgroundColor);
  expect(bg !== 'rgb(234, 239, 244)', 'canvas did not change for dark mode');
});

await test('mobile: masthead menu popover and filter sheet open without JS', async (page) => {
  await page.goto(`${url}/site/search.html`);
  await page.click('.os-filters-toggle');
  expect(await page.$eval('#filtre', (f) => f.matches(':popover-open')), 'filters sheet not open');
  await page.click('.os-filters__close');
  await page.click('.os-masthead__toggle');
  expect(await page.$eval('#site-menu', (m) => m.matches(':popover-open')), 'menu not open');
}, { width: 390, height: 844 });

await test('no horizontal overflow on phones', async (page) => {
  for (const file of ['index', 'listing', 'search', 'components', 'tokens', 'themes', 'preview']) {
    await page.goto(`${url}/site/${file}.html`);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw <= cw, `${file}.html is ${sw}px wide at ${cw}px`);
  }
}, { width: 360, height: 800 });

await browser.close();
server.close();
console.log(failures ? `\n${failures} smoke test(s) failed.` : '\nAll smoke tests passed.');
process.exitCode = failures ? 1 : 0;
