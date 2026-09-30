/*
 * Renders site/tokens.html from window.OS_TOKENS (generated) and the live
 * computed styles, so every value reflects the active theme / mode / density.
 */
(function () {
  'use strict';
  var T = window.OS_TOKENS;
  if (!T) return;
  var meta = T.meta;

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (html != null) node.innerHTML = html;
    return node;
  }

  var probe = el('div', { 'aria-hidden': 'true', style: 'position:absolute;visibility:hidden;pointer-events:none' });
  document.body.append(probe);

  function toHex(rgb) {
    var m = rgb.match(/rgba?\(([^)]+)\)/);
    if (!m) return rgb;
    var parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    var hex = '#' + parts.slice(0, 3).map(function (c) { return Math.round(c).toString(16).padStart(2, '0'); }).join('');
    return parts.length > 3 && parts[3] < 1 ? hex + ' / ' + Math.round(parts[3] * 100) + '%' : hex;
  }

  function computedColor(varName) {
    probe.style.color = 'var(' + varName + ')';
    return toHex(getComputedStyle(probe).color);
  }

  function computedValue(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  function luminance(hex) {
    var n = parseInt(hex.slice(1, 7), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (c) {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }).reduce(function (sum, c, i) { return sum + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }

  function contrast(a, b) {
    var x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }

  /* Semantic colors ---------------------------------------------------- */
  function renderSemantic() {
    var host = document.getElementById('semantic');
    if (!host) return;
    host.innerHTML = '';
    var surface = computedColor('--os-color-surface');
    meta.colors.forEach(function (group) {
      var panel = el('section', { class: 'os-panel', 'aria-label': group.group });
      panel.innerHTML = '<header class="os-panel__header"><h3 class="os-panel__title">' + group.group + '</h3></header>';
      var body = el('div', { class: 'os-panel__body' });
      var table = '<div class="os-table-wrap" tabindex="0" role="region" aria-label="' + group.group + ' colors"><table class="os-table hx-token-table"><thead><tr><th scope="col">Token</th><th scope="col">Now</th><th scope="col">Light / dark</th><th scope="col">Use</th></tr></thead><tbody>';
      group.colors.forEach(function (c) {
        var name = '--os-color-' + c.name;
        var value = computedColor(name);
        var ratio = value.length === 7 && surface.length === 7 ? contrast(value, surface) : null;
        table += '<tr><th scope="row"><span class="hx-swatch" style="background:var(' + name + ')"></span><code>' + name + '</code></th>' +
          '<td class="os-nowrap"><code>' + value + '</code>' + (ratio && c.name.indexOf('text') === 0 || ratio && c.name.indexOf('link') === 0 ? ' <span class="os-badge">' + ratio.toFixed(1) + ':1</span>' : '') + '</td>' +
          '<td class="os-nowrap os-text-muted">' + c.light + ' / ' + c.dark + '</td><td>' + c.description.replace(/</g, '&lt;') + '</td></tr>';
      });
      body.innerHTML = table + '</tbody></table></div>';
      panel.append(body);
      host.append(panel);
    });
  }

  /* Palette ------------------------------------------------------------ */
  function renderPalette() {
    var host = document.getElementById('palette');
    if (!host) return;
    Object.keys(meta.palette).forEach(function (name) {
      var p = meta.palette[name];
      var row = el('div', { class: 'hx-ramp' });
      var html = '<div class="hx-ramp__meta"><h3>' + name + '</h3><p>' + p.description + (p.fixed ? ' <span class="os-badge">hand-picked</span>' : '') + '</p></div><ol class="hx-ramp__steps" role="list">';
      p.steps.forEach(function (step) {
        var v = '--os-' + name + '-' + step;
        var hex = computedValue(v);
        var dark = luminance(hex) < 0.2;
        html += '<li style="background:var(' + v + ');color:' + (dark ? '#fff' : '#111') + '"><span>' + step + '</span><code>' + hex + '</code></li>';
      });
      row.innerHTML = html + '</ol>';
      host.append(row);
    });
  }

  /* Type, space, radius, shadow, roles, icons ------------------------- */
  function renderScales() {
    var type = document.getElementById('type');
    if (type) {
      meta.primitives.text.slice().reverse().forEach(function (k) {
        var v = '--os-text-' + k;
        var row = el('div', { class: 'hx-type-row' });
        row.innerHTML = '<code>' + v + '<br><span class="os-text-muted">' + computedValue(v) + '</span></code><p style="font-size:var(' + v + ')">Lys og koselig 1-roms · 7 500 kr</p>';
        type.append(row);
      });
    }
    var space = document.getElementById('space');
    if (space) {
      meta.primitives.space.forEach(function (k) {
        var v = '--os-space-' + k;
        var row = el('div', { class: 'hx-bar-row' });
        row.innerHTML = '<code>' + v + '</code><span class="hx-bar-row__bar" style="width:var(' + v + ')"></span><span class="os-text-muted os-text-sm">' + computedValue(v) + '</span>';
        space.append(row);
      });
    }
    var radius = document.getElementById('radius');
    if (radius) {
      meta.primitives.radius.forEach(function (k) {
        var v = '--os-radius-' + k;
        radius.append(el('div', { class: 'hx-shape' }, '<span style="border-radius:var(' + v + ')"></span><code>' + v + '</code><small>' + computedValue(v) + '</small>'));
      });
      ['shadow-raised', 'shadow-overlay'].forEach(function (k) {
        radius.append(el('div', { class: 'hx-shape' }, '<span style="box-shadow:var(--os-' + k + ');border-color:transparent"></span><code>--os-' + k + '</code><small>elevation</small>'));
      });
    }
    var roles = document.getElementById('roles');
    if (roles) {
      var html = '<div class="os-table-wrap" tabindex="0" role="region" aria-label="Role token values"><table class="os-table hx-token-table"><thead><tr><th scope="col">Token</th><th scope="col">Now</th><th scope="col">Use</th></tr></thead><tbody>';
      meta.roles.forEach(function (r) {
        html += '<tr><th scope="row"><code>--os-' + r.name + '</code></th><td><code class="hx-value">' + computedValue('--os-' + r.name).replace(/</g, '&lt;') + '</code></td><td>' + r.description + '</td></tr>';
      });
      roles.innerHTML = html + '</tbody></table></div>';
    }
    var icons = document.getElementById('icons');
    if (icons) {
      icons.innerHTML = T.icons.map(function (name) {
        return '<li><svg class="os-icon os-icon--lg" aria-hidden="true"><use href="../dist/icons.svg#os-' + name + '"></use></svg><code>' + name + '</code></li>';
      }).join('');
    }
  }

  function refresh() {
    renderSemantic();
    var roles = document.getElementById('roles');
    if (roles) { roles.innerHTML = ''; }
    var type = document.getElementById('type');
    if (type) type.innerHTML = '';
    var space = document.getElementById('space');
    if (space) space.innerHTML = '';
    var radius = document.getElementById('radius');
    if (radius) radius.innerHTML = '';
    var icons = document.getElementById('icons');
    if (icons) icons.innerHTML = '';
    renderScales();
  }

  renderPalette();
  refresh();
  document.addEventListener('os:preferences', function () { requestAnimationFrame(refresh); });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
})();
