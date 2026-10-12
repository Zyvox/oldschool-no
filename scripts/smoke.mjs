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

const PAGES = ['index', 'portal', 'article', 'detail', 'search', 'app', 'jobs', 'components', 'tokens', 'themes', 'preview'];

await test('toggle: save button presses, persists and toasts', async (page) => {
  await page.goto(`${url}/site/detail.html`);
  const save = '.os-actions [data-os-toggle]';
  await page.click(save);
  expect(await page.getAttribute(save, 'aria-pressed') === 'true', 'not pressed');
  expect((await page.textContent(`${save} .os-action__label`)).trim() === 'Lagret', 'label not swapped');
  expect(await page.isVisible('.os-toast'), 'no toast');
  await page.reload();
  expect(await page.getAttribute(save, 'aria-pressed') === 'true', 'state not persisted');
});

await test('dialog: data-os-dialog opens a modal and Escape closes it', async (page) => {
  await page.goto(`${url}/site/detail.html`);
  await page.click('[data-os-dialog="tips"]');
  expect(await page.$eval('#tips', (d) => d.open), 'dialog not open');
  await page.keyboard.press('Escape');
  expect(!(await page.$eval('#tips', (d) => d.open)), 'dialog still open');
});

await test('tabs: roles, arrow keys and hidden panels', async (page) => {
  await page.goto(`${url}/site/app.html`);
  const tab = page.locator('.os-tabs [role="tab"]').first();
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.getAttribute('.os-tabs [role="tab"][aria-controls="t-faktura"]', 'aria-selected') === 'true', 'second tab not selected');
  expect(await page.$eval('#t-saker', (p) => p.hidden), 'first panel not hidden');
  expect(!(await page.$eval('#t-faktura', (p) => p.hidden)), 'second panel hidden');
});

await test('sort: headers become buttons; dates and "1 284,-" amounts sort numerically', async (page) => {
  await page.goto(`${url}/site/app.html`);
  await page.click('#t-saker thead th:nth-child(3) .os-table__sort');
  expect(await page.getAttribute('#t-saker thead th:nth-child(3)', 'aria-sort') === 'ascending', 'aria-sort not set');
  const dates = await page.$$eval('#t-saker tbody tr td:nth-child(3)', (cells) => cells.map((c) => c.textContent.trim()));
  expect(dates[0] === '30.07.2026' && dates.at(-1) === '12.09.2026', `dates not sorted: ${dates.join(', ')}`);
  await page.click('.os-tabs [aria-controls="t-faktura"]');
  await page.click('#t-faktura thead th:nth-child(3) .os-table__sort');
  await page.click('#t-faktura thead th:nth-child(3) .os-table__sort');
  expect(await page.getAttribute('#t-faktura thead th:nth-child(3)', 'aria-sort') === 'descending', 'second click not descending');
  const amounts = await page.$$eval('#t-faktura tbody td:nth-child(3)', (cells) => cells.map((c) => c.textContent.trim()));
  expect(amounts[0] === '3 900,-', `amounts not sorted: ${amounts.join(', ')}`);
  expect(!(await page.$('#t-faktura thead th[data-os-nosort] button')), 'data-os-nosort header got a button');
});

await test('theme: harness controls set data attributes and persist', async (page) => {
  await page.goto(`${url}/site/detail.html`);
  const before = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor + getComputedStyle(document.body).backgroundColor);
  await page.selectOption('.hx-bar select[data-os-theme-control="theme"]', 'standard');
  await page.selectOption('.hx-bar select[data-os-theme-control="mode"]', 'dark');
  await page.selectOption('.hx-bar select[data-os-theme-control="density"]', 'compact');
  await page.selectOption('.hx-bar select[data-os-theme-control="width"]', 'wide');
  expect(await page.getAttribute('html', 'data-theme') === 'standard', 'theme not set');
  expect(await page.getAttribute('html', 'data-width') === 'wide', 'width not set');
  expect(await page.getAttribute('html', 'data-mode') === 'dark', 'mode not set');
  expect(await page.getAttribute('html', 'data-density') === 'compact', 'density not set');
  await page.goto(`${url}/site/search.html`);
  expect(await page.getAttribute('html', 'data-theme') === 'standard', 'theme not persisted across pages');
  const container = await page.$eval('.os-container', (c) => c.getBoundingClientRect().width);
  expect(container > 1100, `wide container is ${container}px`);
  expect(await page.getAttribute('html', 'data-density') === 'compact', 'density not persisted');
  const after = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor + getComputedStyle(document.body).backgroundColor);
  expect(before !== after, 'canvas did not change');
});

await test('themes page: every theme renders a light and a dark sample', async (page) => {
  await page.goto(`${url}/site/themes.html`);
  const count = await page.$$eval('#theme-gallery .hx-theme__frame', (f) => f.length);
  const themes = await page.evaluate(() => Object.keys(window.OS_THEMES).length);
  expect(count === themes * 2, `${count} samples for ${themes} themes`);
  const canvases = await page.$$eval('#theme-gallery .hx-theme__frame', (f) => new Set(f.map((x) => getComputedStyle(x).backgroundColor)).size);
  expect(canvases >= themes, `only ${canvases} distinct canvas colours`);
});

await test('themes page: accent playground re-colours the previews and passes contrast', async (page) => {
  await page.goto(`${url}/site/themes.html`);
  const frame = '#accent-preview .hx-theme__frame';
  const before = await page.$eval(frame, (f) => getComputedStyle(f).backgroundColor);
  await page.click('#accent-presets [data-hex="#2f6b3f"]');
  const after = await page.$eval(frame, (f) => getComputedStyle(f).backgroundColor);
  expect(before !== after, 'frame colour did not change');
  expect(await page.inputValue('#accent-frame') === 'stone', 'the recipe did not pick its frame');
  expect(await page.$eval(frame, (f) => f.style.getPropertyValue('--os-frame-200') !== f.style.getPropertyValue('--os-accent-200')), 'the stone frame is the accent');
  const code = await page.textContent('#accent-code');
  expect(code.includes("'#2f6b3f'") && code.includes('frame = { hue: 80'), `snippet not updated: ${code}`);
  expect(!(await page.$('#accent-checks .os-badge--danger')), 'a preset fails contrast');
  expect(await page.$$eval('#recipes .hx-theme__frame', (f) => new Set(f.map((x) => x.style.getPropertyValue('--os-accent-600'))).size) === 6, 'recipes are not six colours');
});

await test('stacked table: rows become labelled boxes on phones, a table on desktop', async (page) => {
  await page.goto(`${url}/site/jobs.html`);
  const label = await page.$eval('.os-table--stack tbody tr td:nth-child(2)', (td) => td.dataset.label);
  expect(label === 'Type', `data-label not filled in: ${label}`);
  expect(await page.$eval('.os-table--stack tbody tr', (tr) => getComputedStyle(tr).display) === 'block', 'rows not stacked');
  await page.setViewportSize({ width: 1280, height: 900 });
  expect(await page.$eval('.os-table--stack tbody tr', (tr) => getComputedStyle(tr).display) === 'table-row', 'rows stacked on desktop');
  const [main, aside] = await page.evaluate(() => ['.os-layout__main', '.os-layout__aside'].map((s) => document.querySelector(s).getBoundingClientRect().top));
  expect(Math.abs(main - aside) < 2, 'aside not beside main at 1280px');
}, { width: 390, height: 844 });

await test('menu: opens under its button, also when opened from script', async (page) => {
  await page.goto(`${url}/site/jobs.html`);
  const check = async (label) => {
    const [m, b] = await page.evaluate(() => ['#meny-toyen', '[popovertarget="meny-toyen"]'].map((s) => document.querySelector(s).getBoundingClientRect().toJSON()));
    expect(Math.abs(m.top - (b.bottom + 4)) < 2 || Math.abs(m.bottom - (b.top - 4)) < 2, `${label}: menu top ${m.top}, button bottom ${b.bottom}`);
    expect(m.left < b.right && m.right > b.left, `${label}: menu not over the button (${m.left}–${m.right} vs ${b.left}–${b.right})`);
  };
  await page.click('[popovertarget="meny-toyen"]');
  await page.waitForTimeout(100);
  await check('click');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.getElementById('meny-toyen').showPopover());
  await page.waitForTimeout(100);
  await check('showPopover()');
});

await test('sticky actions: the column keeps the row colour and stays put while scrolling', async (page) => {
  await page.goto(`${url}/site/jobs.html`);
  const result = await page.evaluate(() => {
    const wrap = document.querySelector('.os-table--sticky').closest('.os-table-wrap');
    const cell = document.querySelector('.os-table--sticky tr.os-table__row--danger .os-table__actions');
    const before = cell.getBoundingClientRect().right;
    wrap.scrollLeft = 100;
    return { scrolls: wrap.scrollWidth > wrap.clientWidth, moved: Math.abs(cell.getBoundingClientRect().right - before), bg: getComputedStyle(cell).backgroundImage };
  });
  expect(result.scrolls, 'table does not scroll at this width');
  expect(result.moved < 1, `actions column moved ${result.moved}px`);
  expect(result.bg.includes('gradient'), 'sticky cell has no row colour layer');
}, { width: 720, height: 900 });

await test('notifications: corner window closes, times out, and the centred one is a light-dismiss popover', async (page) => {
  await page.goto(`${url}/site/jobs.html`);
  await page.click('text=Kjør alle nå');
  await page.waitForSelector('.os-toaster--corner .os-notification');
  expect(await page.$eval('.os-toaster--corner', (r) => r.getAttribute('aria-live')) === 'polite', 'region is not a polite live region');
  await page.click('.os-toaster--corner .os-notification__close');
  await page.waitForTimeout(500);
  expect(!(await page.$('.os-toaster--corner .os-notification')), 'close box did not close it');
  await page.evaluate(() => Oldschool.notify({ title: 'Kort', duration: 300 }));
  await page.waitForTimeout(1000);
  expect(!(await page.$('.os-toaster--corner .os-notification')), 'did not time out');
  await page.click('button:has-text("Fortsett »")');
  await page.waitForTimeout(100);
  expect(await page.$eval('.os-notification--center', (n) => n.matches(':popover-open')), 'centred notification not open');
  const [box, vw, vh] = await page.$eval('.os-notification--center', (n) => [n.getBoundingClientRect().toJSON(), innerWidth, innerHeight]);
  expect(Math.abs(box.x + box.width / 2 - vw / 2) < 2 && Math.abs(box.y + box.height / 2 - vh / 2) < 2, 'centred notification is not centred');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  expect(!(await page.$('.os-notification--center')), 'Escape did not close the centred notification');
});

await test('mobile: masthead menu popover and filter sheet open without JS', async (page) => {
  await page.goto(`${url}/site/search.html`);
  await page.click('.os-filters-toggle');
  expect(await page.$eval('#filtre', (f) => f.matches(':popover-open')), 'filters sheet not open');
  await page.click('.os-filters__close');
  await page.click('.os-masthead__toggle');
  expect(await page.$eval('#site-menu', (m) => m.matches(':popover-open')), 'menu not open');
}, { width: 390, height: 844 });

await test('mobile: detail page shows the mobile bar and bleeds boxes to the edge', async (page) => {
  await page.goto(`${url}/site/detail.html`);
  expect(await page.isVisible('.os-mobilebar'), 'mobile bar hidden');
  const left = await page.$eval('.os-layout__main .os-panel', (p) => p.getBoundingClientRect().left);
  expect(left <= 1, `first box starts at ${left}px`);
}, { width: 390, height: 844 });

await test('desktop: mobile bar hidden, side column beside content', async (page) => {
  await page.goto(`${url}/site/detail.html`);
  expect(!(await page.isVisible('.os-mobilebar')), 'mobile bar visible on desktop');
  const [main, aside] = await page.evaluate(() => ['.os-layout__main', '.os-layout__aside'].map((s) => document.querySelector(s).getBoundingClientRect().top));
  expect(Math.abs(main - aside) < 2, 'aside is not beside main');
});

await test('no horizontal overflow on phones (360px)', async (page) => {
  for (const file of PAGES) {
    await page.goto(`${url}/site/${file}.html`);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw <= cw, `${file}.html is ${sw}px wide at ${cw}px`);
  }
}, { width: 360, height: 800 });

await test('no JavaScript errors and no broken local links or assets', async (page) => {
  const failed = [];
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  for (const file of PAGES) {
    await page.goto(`${url}/site/${file}.html`, { waitUntil: 'load' });
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href).filter((h) => h.startsWith(location.origin) && !h.includes('#')));
    for (const link of new Set(links)) {
      const res = await page.request.get(link);
      if (res.status() >= 400) failed.push(`${res.status()} ${link} (from ${file})`);
    }
  }
  expect(!failed.length, failed.slice(0, 3).join('; '));
});

await browser.close();
server.close();
console.log(failures ? `\n${failures} smoke test(s) failed.` : '\nAll smoke tests passed.');
process.exitCode = failures ? 1 : 0;
