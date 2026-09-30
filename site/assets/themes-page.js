/*
 * Themes page: renders one preview card per theme × mode (scoped theming —
 * each card carries its own data-theme / data-mode), and the theme generator.
 */
import { accentRamp, neutralRamp, contrastRatio, hexToOklch, ACCENT_STEPS, NEUTRAL_STEPS } from '../../dist/esm/color.js';

const T = window.OS_TOKENS;
const I = (name) => `<svg class="os-icon" aria-hidden="true"><use href="../dist/icons.svg#os-${name}"></use></svg>`;

function card(theme, mode, label, description) {
  return `
  <article class="hx-theme" data-theme="${theme}" data-mode="${mode}" aria-label="${label}, ${mode}">
    <div class="hx-theme__top">
      <span class="os-brand"><svg class="os-brand__mark" viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor"><rect x="2" y="2" width="9" height="11" rx="2.5"/><rect x="14" y="2" width="16" height="11" rx="2.5"/><rect x="2" y="16" width="9" height="14" rx="2.5"/><rect x="14" y="16" width="16" height="14" rx="2.5"/></g></svg><span class="os-brand__name">${label}</span></span>
      <span class="os-badge">${mode === 'dark' ? `${I('moon')} dark` : `${I('sun')} light`}</span>
    </div>
    <section class="os-panel">
      <header class="os-panel__header"><h3 class="os-panel__title">Prisinformasjon</h3></header>
      <div class="os-panel__body os-stack os-stack--sm">
        <p class="os-price os-price--inline"><span class="os-price__label">Leie pr. måned</span><span class="os-price__amount">7 500 kr</span></p>
        <dl class="os-kv os-kv--sm">
          <div><dt>Depositum</dt><dd>30 000 kr</dd></div>
          <div><dt>Bruksareal</dt><dd>29 m²</dd></div>
        </dl>
        <p class="os-text-sm">Se <a href="#">prisstatistikk</a> for området.</p>
        <div class="os-cluster os-cluster--sm">
          <button class="os-button os-button--primary os-button--sm" type="button">${I('mail')}Send e-post</button>
          <button class="os-button os-button--sm" type="button">Ring</button>
          <span class="os-badge os-badge--success">Ny</span>
          <span class="os-badge os-badge--info os-badge--dot">Visning</span>
        </div>
      </div>
    </section>
    <ol class="hx-theme__ramp" role="list" aria-hidden="true">${ACCENT_STEPS.map((s) => `<li style="background:var(--os-accent-${s})"></li>`).join('')}</ol>
    ${description ? `<p class="hx-theme__desc">${description}</p>` : ''}
  </article>`;
}

/* Gallery ------------------------------------------------------------------ */
const gallery = document.getElementById('theme-gallery');
if (gallery && T) {
  gallery.innerHTML = Object.entries(T.meta.themes).map(([key, t]) => `
    <section class="hx-theme-pair" aria-labelledby="t-${key}">
      <div class="hx-theme-pair__head">
        <h3 id="t-${key}">${t.label} <code>data-theme="${key}"</code></h3>
        <p>${t.description}</p>
        <button class="os-button os-button--sm os-button--tint" type="button" data-apply-theme="${key}">Use on this site</button>
      </div>
      <div class="hx-theme-pair__cards">${card(key, 'light', t.label)}${card(key, 'dark', t.label)}</div>
    </section>`).join('');
  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('[data-apply-theme]');
    if (button) window.Oldschool?.theme.set({ theme: button.dataset.applyTheme });
  });
}

/* Generator ---------------------------------------------------------------- */
const form = document.getElementById('generator');
if (form) {
  const preview = document.getElementById('gen-preview');
  const output = document.getElementById('gen-output');
  const checks = document.getElementById('gen-checks');
  const fields = ['name', 'hue', 'chroma', 'shift', 'nhue', 'nchroma'].reduce((acc, id) => ({ ...acc, [id]: form.elements[id] }), {});

  preview.innerHTML = `<div class="hx-theme-pair__cards">${card('custom', 'light', 'Min tema')}${card('custom', 'dark', 'Min tema')}</div>`;

  const update = () => {
    const name = (fields.name.value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') || 'custom').replace(/^-|-$/g, '');
    const accent = accentRamp({ hue: +fields.hue.value, chroma: +fields.chroma.value, hueShift: +fields.shift.value });
    const neutral = neutralRamp({ hue: +fields.nhue.value, chroma: +fields.nchroma.value });
    form.querySelectorAll('output[for]').forEach((out) => { out.value = form.elements[out.htmlFor].value; });

    const vars = [
      ...ACCENT_STEPS.map((s) => `--os-accent-${s}: ${accent[s]};`),
      ...NEUTRAL_STEPS.map((s) => `--os-neutral-${s}: ${neutral[s]};`),
    ];
    preview.querySelectorAll('.hx-theme').forEach((el) => {
      el.style.cssText = vars.join('');
      el.querySelectorAll('.os-brand__name').forEach((n) => { n.textContent = fields.name.value || 'Min tema'; });
    });
    document.getElementById('gen-swatch').style.background = accent[600];

    const pairs = [
      ['Link on white', accent[700], neutral[0]],
      ['Link on tint band', accent[700], accent[50]],
      ['White on primary button', neutral[0], accent[600]],
      ['Muted text on canvas', neutral[600], neutral[100]],
      ['Dark: link on surface', accent[300], neutral[950]],
      ['Dark: label on button', neutral[1000], accent[400]],
    ];
    checks.innerHTML = pairs.map(([label, fg, bg]) => {
      const r = contrastRatio(fg, bg);
      const ok = r >= 4.5;
      return `<li class="hx-check ${ok ? 'is-ok' : 'is-bad'}"><span class="hx-check__sample" style="color:${fg};background:${bg}">Aa</span><span>${label}</span><strong>${r.toFixed(2)}:1</strong>${ok ? I('circle-check') : I('circle-alert')}</li>`;
    }).join('');

    const [L, C, H] = hexToOklch(accent[600]);
    output.textContent = `/* 1 · tokens/palette.mjs → accents (and neutrals if you want your own grey) */
${name}: { hue: ${fields.hue.value}, chroma: ${fields.chroma.value}, hueShift: ${fields.shift.value}, description: '…' },
${name}Grey: { hue: ${fields.nhue.value}, chroma: ${fields.nchroma.value}, description: '…' },   // in neutrals

/* 2 · tokens/themes.mjs → themes */
${name}: { label: '${fields.name.value || 'Custom'}', accent: '${name}', neutral: '${name}Grey', description: '…' },

/* …then npm run build. Or, without the build, paste this CSS after oldschool.css: */
[data-theme="${name}"] {
  /* accent-600 = oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)}) */
${vars.map((v) => `  ${v}`).join('\n')}
}`;
  };

  form.addEventListener('input', update);
  document.getElementById('gen-copy').addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.textContent);
    window.Oldschool?.toast('Theme copied — paste it after oldschool.css', { icon: 'clipboard-check' });
  });
  document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const [hue, chroma, nhue, nchroma, name] = b.dataset.preset.split(',');
    Object.assign(fields.hue, { value: hue });
    Object.assign(fields.chroma, { value: chroma });
    Object.assign(fields.nhue, { value: nhue });
    Object.assign(fields.nchroma, { value: nchroma });
    fields.name.value = name;
    update();
  }));
  update();
}
