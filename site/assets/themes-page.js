/*
 * Builds site/themes.html: scoped copies of <template id="sample"> per theme ×
 * mode, the accent playground, the recipes strip and the density strip.
 * Ramps come from the same colour engine the build uses (src/js/color.js).
 * Showcase only — not part of the design system.
 */
import { schemeFromSeeds, contrastRatio } from '../../dist/esm/color.js';

const T = window.OS_TOKENS;
const template = document.getElementById('sample');
const seeds = T.resolved.seeds;
const PRESETS = [
  ['Portal blue', '#2a5aa8'],
  ['Forest', '#2f6b3f', true],
  ['Burgundy', '#8e2a3e'],
  ['Amber', '#b25d00', true],
  ['Heather', '#6b4a9a'],
  ['Teal', '#1f6f7a'],
  ['Slate', '#4a5868', true],
];

function sample(attrs, caption) {
  const figure = document.createElement('figure');
  figure.className = 'hx-theme';
  const frame = document.createElement('div');
  frame.className = 'hx-theme__frame';
  for (const [k, v] of Object.entries(attrs)) frame.setAttribute(`data-${k}`, v);
  frame.lang = 'nb';
  frame.inert = true;
  frame.append(template.content.cloneNode(true));
  figure.append(frame);
  if (caption) {
    const cap = document.createElement('figcaption');
    cap.className = 'os-text-sm os-text-muted';
    cap.innerHTML = caption;
    figure.append(cap);
  }
  return figure;
}

/** Ramps for an accent seed; link = blue seed when blueLinks. */
function scheme(accent, blueLinks) {
  return schemeFromSeeds({ accent, neutral: seeds.neutral, link: blueLinks ? seeds.accent : null });
}

/** Paint a scheme onto a themed frame with inline custom properties. */
function paint(frame, s) {
  for (const name of ['accent', 'neutral']) {
    for (const [step, hex] of Object.entries(s[name])) frame.style.setProperty(`--os-${name}-${step}`, hex);
  }
  const link = s.link;
  if (link) {
    frame.style.setProperty('--os-color-link', `light-dark(${link[700]}, ${link[300]})`);
    frame.style.setProperty('--os-color-link-hover', `light-dark(${link[800]}, ${link[200]})`);
  } else {
    frame.style.removeProperty('--os-color-link');
    frame.style.removeProperty('--os-color-link-hover');
  }
}

/* Retro and standard, light and dark ------------------------------------- */
const gallery = document.getElementById('theme-gallery');
if (gallery) {
  for (const [name, t] of Object.entries(T.meta.themes)) {
    const row = document.createElement('section');
    row.className = 'hx-theme-row';
    row.setAttribute('aria-labelledby', `theme-${name}`);
    row.innerHTML = `<div class="hx-theme-row__head"><h3 class="os-text-md" id="theme-${name}">${t.label} <code>${name}</code>${name === T.meta.defaultTheme ? ' <span class="os-badge os-badge--accent">default</span>' : ''}</h3>
      <button class="os-button os-button--sm" type="button" data-use="${name}">Use this theme</button></div>
      <p class="os-text-sm os-text-muted">${t.description}</p>`;
    const pair = document.createElement('div');
    pair.className = 'hx-themes';
    pair.append(sample({ theme: name, mode: 'light' }, 'Light'), sample({ theme: name, mode: 'dark' }, 'Dark'));
    row.append(pair);
    gallery.append(row);
  }
  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('[data-use]');
    if (!button || !window.Oldschool) return;
    window.Oldschool.theme.set({ theme: button.dataset.use });
    window.Oldschool.toast(`Theme: ${T.meta.themes[button.dataset.use].label}`);
  });
}

/* Accent playground ------------------------------------------------------- */
const form = document.getElementById('accent-form');
if (form) {
  const pick = document.getElementById('accent-pick');
  const hex = document.getElementById('accent-hex');
  const blue = document.getElementById('accent-bluelinks');
  const presets = document.getElementById('accent-presets');
  const preview = document.getElementById('accent-preview');
  const checks = document.getElementById('accent-checks');
  const code = document.getElementById('accent-code');
  const frames = [
    sample({ theme: 'retro', mode: 'light' }, 'Retro, light'),
    sample({ theme: 'standard', mode: 'light' }, 'Standard, light'),
    sample({ theme: 'retro', mode: 'dark' }, 'Retro, dark'),
  ];
  preview.append(...frames);

  presets.innerHTML = PRESETS.map(([label, value, links]) =>
    `<button class="os-button os-button--sm" type="button" data-hex="${value}"${links ? ' data-links' : ''}><span class="hx-swatch" style="background:${value}"></span>${label}</button>`).join('');

  const update = () => {
    const value = hex.value.trim();
    if (!/^#[0-9a-f]{6}$/i.test(value)) return;
    pick.value = value.toLowerCase();
    const s = scheme(value, blue.checked);
    frames.forEach((f) => paint(f.querySelector('.hx-theme__frame'), s));
    const a = s.accent;
    const n = s.neutral;
    const l = s.link ?? a;
    const rows = [
      ['Links on white', l[700], n[0], 4.5],
      ['Links on the retro frame', l[700], a[200], 4.5],
      ['Links on header bands', l[700], a[100], 4.5],
      ['White text on buttons', n[0], a[600], 4.5],
      ['Focus ring on white', a[600], n[0], 3],
      ['Links in dark mode', l[300], n[950], 4.5],
    ];
    checks.innerHTML = rows.map(([label, fg, bg, min]) => {
      const ratio = contrastRatio(fg, bg);
      const ok = ratio >= min;
      return `<div><dt>${label}</dt><dd>${ratio.toFixed(1)}:1 <span class="os-badge os-badge--${ok ? 'success' : 'danger'}">${ok ? 'AA' : 'fails'}</span></dd></div>`;
    }).join('');
    code.textContent = `// tokens/palette.mjs\nexport const accent = '${value.toLowerCase()}';\nexport const link = ${blue.checked ? `'${seeds.accent}'; // classic blue links` : 'null;'}`;
  };

  pick.addEventListener('input', () => { hex.value = pick.value; update(); });
  hex.addEventListener('input', update);
  blue.addEventListener('change', update);
  presets.addEventListener('click', (event) => {
    const button = event.target.closest('[data-hex]');
    if (!button) return;
    hex.value = button.dataset.hex;
    blue.checked = button.hasAttribute('data-links');
    update();
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  update();
}

/* Recipes ----------------------------------------------------------------- */
const recipes = document.getElementById('recipes');
if (recipes) {
  for (const [label, value, links] of PRESETS.slice(0, 4)) {
    const fig = sample({ theme: 'retro', mode: 'light' },
      `<strong>${label}</strong> — <code>accent = '${value}'</code>${links ? ' + blue links' : ''}`);
    paint(fig.querySelector('.hx-theme__frame'), scheme(value, links));
    recipes.append(fig);
  }
}

/* Densities --------------------------------------------------------------- */
const densities = document.getElementById('densities');
if (densities) {
  const notes = T.meta.densities || {};
  for (const [key, label] of [['compact', 'Compact'], ['standard', 'Standard'], ['comfortable', 'Comfortable']]) {
    densities.append(sample({ density: key }, `${label} — ${notes[key] ?? 'the default.'}`));
  }
}
