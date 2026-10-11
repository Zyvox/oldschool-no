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

  function toPx(value) {
    return parseFloat(value) * (/rem$/.test(value) ? 16 : 1) || 0;
  }

  function px(value) {
    var m = /^([\d.]+)rem$/.exec(value);
    return m ? value + ' = ' + parseFloat(m[1]) * 16 + 'px' : value;
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

  /* Semantic colours --------------------------------------------------- */
  function renderSemantic() {
    var host = document.getElementById('semantic');
    if (!host) return;
    host.innerHTML = '';
    var surface = computedColor('--os-color-surface');
    meta.colors.forEach(function (group) {
      var id = 'sem-' + group.group.toLowerCase().replace(/[^a-z]+/g, '-');
      var html = '<h3 class="os-text-md" id="' + id + '">' + group.group + '</h3>' +
        '<div class="os-table-wrap" tabindex="0" role="region" aria-labelledby="' + id + '"><table class="os-table os-table--compact hx-token-table"><thead><tr><th scope="col">Token</th><th scope="col">Now</th><th scope="col">Light / dark</th><th scope="col">Use</th></tr></thead><tbody>';
      group.colors.forEach(function (c) {
        var name = '--os-color-' + c.name;
        var value = computedColor(name);
        var textual = /^(text|link)/.test(c.name);
        var ratio = textual && !/inverse|on-/.test(c.name) && value.length === 7 && surface.length === 7 ? contrast(value, surface) : null;
        html += '<tr><th scope="row"><span class="hx-swatch" style="background:var(' + name + ')"></span><code>' + name + '</code></th>' +
          '<td class="os-nowrap"><code>' + value + '</code>' + (ratio ? ' <span class="os-badge' + (ratio >= 4.5 ? '' : ' os-badge--warning') + '">' + ratio.toFixed(1) + ':1</span>' : '') + '</td>' +
          '<td class="os-nowrap os-text-muted">' + c.light + ' / ' + c.dark + '</td><td>' + c.description.replace(/</g, '&lt;') + '</td></tr>';
      });
      var section = el('div', { class: 'os-stack os-stack--xs' }, html + '</tbody></table></div>');
      host.append(section);
    });
  }

  /* Palette ------------------------------------------------------------ */
  function renderPalette() {
    var host = document.getElementById('palette');
    if (!host) return;
    host.innerHTML = '';
    var ramps = T.resolved.palette;
    Object.keys(meta.palette).forEach(function (name) {
      var p = meta.palette[name];
      var seed = typeof p.seed === 'string' ? p.seed : JSON.stringify(p.seed).replace(/"/g, '');
      var html = '<h3 class="os-text-md">' + name + ' <span class="os-text-muted os-text-sm">— ' + p.description + ' Seed: <code>' + seed + '</code></span></h3><ol class="hx-ramp" role="list">';
      Object.keys(ramps[name]).forEach(function (step) {
        var hex = ramps[name][step];
        var dark = contrast(hex, '#ffffff') > contrast(hex, '#111111');
        html += '<li style="background:' + hex + ';color:' + (dark ? '#fff' : '#111') + '"><strong>' + step + '</strong><br><code>' + hex + '</code></li>';
      });
      host.append(el('div', { class: 'hx-ramp-group' }, html + '</ol>'));
    });
  }

  /* Type, space, radius, shadow, roles, icons ------------------------- */
  function renderScales() {
    var type = document.getElementById('type');
    if (type) {
      meta.primitives.text.slice().reverse().forEach(function (k) {
        var v = '--os-text-' + k;
        var row = el('div', { class: 'hx-type-row' });
        row.innerHTML = '<div><code>' + v + '</code><br><span class="os-text-muted os-text-xs">' + px(computedValue(v)) + '</span></div><p style="font-size:var(' + v + ')">Høstjazz i Botanisk hage · 250,-</p>';
        type.append(row);
      });
    }
    var space = document.getElementById('space');
    if (space) {
      meta.primitives.space.slice().sort(function (a, b) { return toPx(computedValue('--os-space-' + a)) - toPx(computedValue('--os-space-' + b)); }).forEach(function (k) {
        var v = '--os-space-' + k;
        var row = el('div', { class: 'hx-bar-row' });
        row.innerHTML = '<code>' + v + '</code><span style="width:var(' + v + ')"></span><span class="os-text-muted">' + px(computedValue(v)) + '</span>';
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
      var html = '<div class="os-table-wrap" tabindex="0" role="region" aria-label="Role token values"><table class="os-table os-table--compact hx-token-table"><thead><tr><th scope="col">Token</th><th scope="col">Now</th><th scope="col">Use</th></tr></thead><tbody>';
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
