# Theming

Oldschool separates three independent axes, each an attribute that works on
`<html>` or on any element:

| Attribute | Values | What changes |
|---|---|---|
| `data-theme` | `fjord` (default) · `furu` · `lyng` · `nordlys` · `bjork` · `tyttebaer` · `retro` · `kontrast` | which color ramps feed the tokens (and, for `retro`/`kontrast`, some structure) |
| `data-mode` | `auto` (default) · `light` · `dark` | light or dark, via `color-scheme` |
| `data-density` | `comfortable` (default) · `compact` | padding, row height, control height, body size |

```html
<html lang="nb" data-theme="furu" data-mode="auto">
  …
  <aside data-theme="retro">This box looks like 2011.</aside>
  <footer data-mode="dark">A dark footer on a light page.</footer>
</html>
```

## How it works

```
tokens/palette.mjs   ramps: fjord-50…950, is-0…1000, …   (--os-fjord-600)
        │
tokens/themes.mjs    theme = accent ramp + neutral ramp   (--os-accent-600: var(--os-fjord-600))
        │
tokens/semantic.mjs  role → step, per mode                (--os-color-link: light-dark(var(--os-accent-700), var(--os-accent-300)))
        │
components           use roles only                       (color: var(--os-color-link))
```

1. **Palette** — raw ramps generated in OKLCH. Every accent ramp uses the same
   lightness per step (50 → 0.972 … 950 → 0.255), neutrals likewise. That is
   why swapping ramps never breaks contrast.
2. **Theme** — maps `--os-accent-*`, `--os-neutral-*` and `--os-visited-*` to
   palette ramps, and may override primitives, role tokens or colors.
3. **Semantic colors** — `--os-color-*`, each defined as
   `light-dark(<light step>, <dark step>)`. The *mode* is decided where the color
   is *used*, by the inherited `color-scheme`; the *hue* is decided where the
   token is *declared*.
4. **Role tokens** — `--os-pad`, `--os-radius-panel`, `--os-control-height`…
   re-declared on every `[data-theme]` / `[data-density]` so overrides cascade
   into subtrees.

Because semantic and role tokens are re-declared on every `[data-theme]`
element (with zero specificity via `:where()`), scoped themes just work. A
scoped element also re-applies text color, font and canvas background.

### Fallback

Browsers without `light-dark()` (Safari < 17.5, Chrome < 123) receive a
light-only copy of every semantic token, generated automatically inside
`@supports not (color: light-dark(#000, #fff))`.

## Persisting the user's choice

`oldschool.js` exposes `Oldschool.theme.set({ theme, mode, density })`, stores
it in `localStorage` (`os-prefs`), syncs across tabs and iframes, and binds any
control with `data-os-theme-control="theme|mode|density"` (a `<select>` or a
group of radios). Add this in `<head>` before the stylesheet to avoid a flash:

```html
<script>(function(){try{var p=JSON.parse(localStorage.getItem('os-prefs')||'{}'),d=document.documentElement;if(d.hasAttribute('data-os-lock'))return;if(p.theme)d.dataset.theme=p.theme;if(p.mode&&p.mode!=='auto')d.dataset.mode=p.mode;if(p.density&&p.density!=='comfortable')d.dataset.density=p.density}catch(e){}})()</script>
```

`<html data-os-lock>` keeps a page on its own theme regardless of preferences.

## Making a theme

### Option A — generator (no build)

Open `site/themes.html#generator-title`, pick hue/chroma, check the contrast
readout, copy the CSS and paste it after `oldschool.css`:

```css
[data-theme="havgap"] {
  --os-accent-50: #eaf9fd;  /* … 11 accent steps … */
  --os-neutral-0: #ffffff;  /* … 16 neutral steps … */
}
```

### Option B — in the token source (recommended for this repo)

```js
// tokens/palette.mjs → accents
havgap: { hue: 222, chroma: 0.12, hueShift: -8, description: 'Sea green-blue.' },

// tokens/themes.mjs → themes
havgap: { label: 'Havgap', accent: 'havgap', neutral: 'is', description: '…' },
```

Run `npm run build` then `npm run check` — the contrast gate tests all 37 role
pairs in light and dark for your new theme and fails the build if any is
below WCAG AA. Rules of thumb:

- chroma 0.07–0.17 feels Nordic; above 0.2 gets loud,
- very light hues (yellow ≈ 90–110°) need care: the ramp is fine, but the
  accent reads as brown at step 700 — consider using it for `warning` only,
- neutrals: chroma ≤ 0.015, hue close to the accent or deliberately warm (`sand`).

### Overrides beyond color

`retro` and `kontrast` show what else a theme can change:

```js
roles: { 'radius-panel': '0', 'font-body': 'Arial, Helvetica, sans-serif', gap: '0.5rem' },
primitives: { 'text-md': '0.8125rem' },
colors: { canvas: { light: 'accent.200', dark: 'neutral.1000' }, 'panel-border': { light: 'transparent', dark: 'transparent' } },
```

Structural overrides are inherited by nested themes (a `fjord` island inside a
`retro` page keeps square corners). Nest color themes freely; nest structural
themes deliberately.

## Overriding a single token

Your own unlayered CSS always wins over Oldschool's layers — no `!important`:

```css
:root { --os-radius-panel: 12px; --os-color-price: var(--os-accent-800); }
.my-sidebar { --os-pad: 1rem; }
```
