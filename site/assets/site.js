/*
 * Showcase harness — NOT part of the design system.
 * Injects the grey toolbar at the top (page links + theme/mode/density) and
 * turns <div data-demo> blocks into live examples with their markup below.
 *
 * Load order: generated/themes.js → site.js → oldschool.js (all defer), so
 * code samples capture markup before oldschool.js enhances it.
 */
(function () {
  'use strict';

  var PAGES = [
    ['index.html', 'Overview'],
    ['portal.html', 'Front'],
    ['article.html', 'Article'],
    ['detail.html', 'Detail'],
    ['search.html', 'Search'],
    ['app.html', 'Forms'],
    ['jobs.html', 'App'],
    ['components.html', 'Components'],
    ['tokens.html', 'Tokens'],
    ['themes.html', 'Themes'],
    ['preview.html', 'Devices'],
  ];

  function options(map, current) {
    return Object.keys(map).map(function (key) {
      return '<option value="' + key + '">' + map[key] + '</option>';
    }).join('');
  }

  function harnessBar() {
    if (window.self !== window.top) return;
    var current = location.pathname.split('/').pop() || 'index.html';
    var bar = document.createElement('div');
    bar.className = 'hx-bar';
    bar.setAttribute('lang', 'en');
    bar.setAttribute('data-os-print-hide', '');
    bar.innerHTML =
      '<div class="hx-bar__inner">' +
        '<a class="hx-bar__home" href="index.html"><strong>Oldschool</strong> harness</a>' +
        '<button class="hx-bar__toggle" type="button" popovertarget="hx-pages">Pages ▾</button>' +
        '<nav class="hx-bar__pages" id="hx-pages" popover aria-label="Showcase pages"><ul role="list">' +
          PAGES.map(function (p) {
            return '<li><a href="' + p[0] + '"' + (p[0] === current ? ' aria-current="page"' : '') + '>' + p[1] + '</a></li>';
          }).join('') +
        '</ul></nav>' +
        '<button class="hx-bar__toggle hx-bar__toggle--end" type="button" popovertarget="hx-controls">Theme ▾</button>' +
        '<div class="hx-bar__controls" id="hx-controls" popover>' +
          '<label>Theme <select data-os-theme-control="theme">' + options(window.OS_THEMES || { retro: 'Retro', standard: 'Standard' }) + '</select></label>' +
          '<label>Mode <select data-os-theme-control="mode">' + options({ auto: 'Auto', light: 'Light', dark: 'Dark' }) + '</select></label>' +
          '<label>Density <select data-os-theme-control="density">' + options({ compact: 'Compact', standard: 'Standard', comfortable: 'Comfortable' }) + '</select></label>' +
          '<label>Width <select data-os-theme-control="width">' + options({ classic: 'Classic', wide: 'Wide' }) + '</select></label>' +
        '</div>' +
      '</div>';
    var skip = document.querySelector('.os-skiplink');
    if (skip) skip.after(bar);
    else document.body.prepend(bar);
  }

  function dedent(text) {
    var lines = text.replace(/^\n+|\s+$/g, '').split('\n');
    var indent = Infinity;
    lines.forEach(function (line) {
      if (line.trim()) indent = Math.min(indent, line.match(/^ */)[0].length);
    });
    return lines.map(function (line) { return line.slice(indent === Infinity ? 0 : indent); }).join('\n');
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function codeSamples() {
    document.querySelectorAll('[data-demo]').forEach(function (demo) {
      var code = dedent(demo.innerHTML).replace(/\n{3,}/g, '\n\n');
      var details = document.createElement('details');
      details.className = 'os-disclosure hx-code';
      details.innerHTML = '<summary>Show markup</summary>' +
        '<div class="os-disclosure__content"><pre tabindex="0"><code></code></pre>' +
        '<p><button class="os-button os-button--sm" type="button">Copy markup</button></p></div>';
      details.querySelector('code').innerHTML = escapeHtml(code);
      details.querySelector('button').addEventListener('click', function () {
        navigator.clipboard.writeText(code).then(function () {
          if (window.Oldschool) window.Oldschool.toast('Markup copied');
        });
      });
      demo.after(details);
    });
  }

  function start() {
    harnessBar();
    codeSamples();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
