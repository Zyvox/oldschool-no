/*
 * Showcase harness — NOT part of the design system.
 * Injects the top "harness bar" (page links + theme/mode/density switchers)
 * and powers the live code samples on the documentation pages.
 *
 * Load order matters: generated/themes.js → site.js → oldschool.js (all defer),
 * so code samples capture the markup before oldschool.js enhances it, and
 * oldschool.js then binds the harness bar's theme controls.
 */
(function () {
  'use strict';

  var PAGES = [
    ['index.html', 'Overview'],
    ['listing.html', 'Listing'],
    ['search.html', 'Search'],
    ['components.html', 'Components'],
    ['tokens.html', 'Tokens'],
    ['themes.html', 'Themes'],
    ['preview.html', 'Devices'],
  ];

  var ICONS = '../dist/icons.svg';

  function icon(name) {
    return '<svg class="os-icon" aria-hidden="true"><use href="' + ICONS + '#os-' + name + '"></use></svg>';
  }

  function themeOptions() {
    var themes = window.OS_THEMES || { fjord: 'Fjord' };
    return Object.keys(themes).map(function (key) {
      return '<option value="' + key + '">' + themes[key] + '</option>';
    }).join('');
  }

  function harnessBar() {
    if (document.documentElement.hasAttribute('data-hx-no-bar') || window.self !== window.top) return;
    var current = location.pathname.split('/').pop() || 'index.html';
    var bar = document.createElement('div');
    bar.className = 'hx-bar';
    bar.setAttribute('lang', 'en');
    bar.setAttribute('data-os-print-hide', '');
    bar.innerHTML =
      '<div class="hx-bar__inner">' +
        '<a class="hx-bar__home" href="index.html">' +
          '<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor"><rect x="2" y="2" width="9" height="11" rx="2.5"/><rect x="14" y="2" width="16" height="11" rx="2.5"/><rect x="2" y="16" width="9" height="14" rx="2.5"/><rect x="14" y="16" width="16" height="14" rx="2.5"/></g></svg>' +
          '<span>Oldschool <em>harness</em></span></a>' +
        '<button class="hx-bar__toggle" type="button" popovertarget="hx-pages">' + icon('layout-list') + 'Pages</button>' +
        '<nav class="hx-bar__pages" id="hx-pages" popover aria-label="Showcase pages"><ul role="list">' +
          PAGES.map(function (p) {
            return '<li><a href="' + p[0] + '"' + (p[0] === current ? ' aria-current="page"' : '') + '>' + p[1] + '</a></li>';
          }).join('') +
        '</ul></nav>' +
        '<button class="hx-bar__toggle hx-bar__toggle--end" type="button" popovertarget="hx-controls">' + icon('palette') + 'Theme</button>' +
        '<div class="hx-bar__controls" id="hx-controls" popover>' +
          '<label class="hx-bar__field"><span>Theme</span><select class="hx-bar__select" data-os-theme-control="theme">' + themeOptions() + '</select></label>' +
          '<fieldset class="hx-bar__modes" data-os-theme-control="mode"><legend class="os-sr-only">Color mode</legend>' +
            ['auto', 'light', 'dark'].map(function (m) {
              var names = { auto: ['monitor', 'Auto'], light: ['sun', 'Light'], dark: ['moon', 'Dark'] };
              return '<label title="' + names[m][1] + '"><input type="radio" name="hx-mode" value="' + m + '">' + icon(names[m][0]) + '<span>' + names[m][1] + '</span></label>';
            }).join('') +
          '</fieldset>' +
          '<label class="hx-bar__field"><span>Density</span><select class="hx-bar__select" data-os-theme-control="density"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>' +
        '</div>' +
      '</div>';
    var skip = document.querySelector('.os-skiplink');
    if (skip) skip.after(bar);
    else document.body.prepend(bar);
  }

  /* ---------------------------------------------------------------------
   * Live code samples: <div class="hx-demo" data-demo> … </div> gets a
   * "Code" disclosure with its own markup, dedented and escaped.
   * ------------------------------------------------------------------- */
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

  function highlight(html) {
    return html
      .replace(/(&lt;\/?)([a-z0-9-]+)/g, '$1<span class="hx-tag">$2</span>')
      .replace(/([a-z-:]+)=(&quot;|")(.*?)\2/g, '<span class="hx-attr">$1</span>=<span class="hx-str">"$3"</span>');
  }

  function codeSamples() {
    document.querySelectorAll('[data-demo]').forEach(function (demo) {
      var source = demo.dataset.demoSource ? document.getElementById(demo.dataset.demoSource).innerHTML : demo.innerHTML;
      var code = dedent(source)
        .replace(/ data-os-ready=""/g, '')
        .replace(/\n{3,}/g, '\n\n');
      var details = document.createElement('details');
      details.className = 'hx-code';
      details.innerHTML = '<summary>' + icon('code') + 'Code</summary>' +
        '<div class="hx-code__body"><button class="os-button os-button--sm hx-code__copy" type="button">' + icon('copy') + 'Copy</button>' +
        '<pre tabindex="0"><code></code></pre></div>';
      details.querySelector('code').innerHTML = highlight(escapeHtml(code));
      details.querySelector('.hx-code__copy').addEventListener('click', function () {
        navigator.clipboard.writeText(code).then(function () {
          if (window.Oldschool) window.Oldschool.toast('Copied to clipboard', { icon: 'clipboard-check' });
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
