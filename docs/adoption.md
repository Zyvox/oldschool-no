# Adopting Oldschool in another repo

Pick the lightest option that fits.

## 1. Your own colours first

If your brand is not portal blue, make a clone (or fork) and change the seed
before anything else:

```bash
git clone https://github.com/Zyvox/oldschool-no.git && cd oldschool-no
# edit tokens/palette.mjs → export const accent = '#2f6b3f';
npm run build && npm test
```

The build regenerates `dist/` with your ramps; the test fails if the colour
breaks a contrast pair. Then use *your* `dist/` with any option below. See
[theming.md](theming.md#changing-the-colours).

## 2. Copy the built files (any stack)

Copy `dist/` (or the pieces you need) into your static assets:

```
dist/oldschool.min.css  tokens, both themes, all components (15 kB gzip; .css is the readable twin)
dist/oldschool.min.js   optional behaviors, classic script (5 kB gzip)
dist/icons.svg          optional icon sprite — reference as icons.svg#os-<name>
```

No fonts or images to copy: Verdana and Arial come from the system.

## 3. Install from Git

```bash
npm install github:Zyvox/oldschool-no        # or your fork with your colours
```

```js
import 'oldschool-no/css/min';               // dist/oldschool.min.css
import { toast, theme } from 'oldschool-no'; // dist/esm (auto-initialises on import)
import tokens from 'oldschool-no/tokens.json' with { type: 'json' };
```

`src/css/*` is importable too if you want only some layers, e.g. tokens + base
+ panel + kv.

## 4. Tailwind

**v4** — CSS-first:

```css
@import "tailwindcss";
@import "oldschool-no/dist/oldschool.css";
@import "oldschool-no/dist/tailwind.css";
```

```html
<div class="bg-surface border border-line rounded-panel p-pad text-fg">
  <p class="text-fg-muted text-sm">Leie pr. mnd.</p>
  <p class="text-price text-3xl font-bold tabular-nums">7 500,-</p>
  <a class="text-link underline">Se alle priser</a>
</div>
```

Semantic colors are renamed to avoid `text-text-…`: `text` → `fg`,
`text-muted` → `fg-muted`, `border` → `line`, `text-on-accent` → `on-accent`.
All utilities follow `data-theme` / `data-mode` because they point at the
CSS variables.

**v3** — `presets: [require('oldschool-no/dist/tailwind-preset.cjs')]`.

## 5. Component frameworks

Components are HTML + classes, so wrappers are thin. React example:

```jsx
export function Panel({ title, action, children, variant }) {
  const id = useId();
  return (
    <section className={`os-panel${variant ? ` os-panel--${variant}` : ''}`} aria-labelledby={id}>
      <header className="os-panel__header">
        <h2 className="os-panel__title" id={id}>{title}</h2>
        {action}
      </header>
      <div className="os-panel__body">{children}</div>
    </section>
  );
}

export const Facts = ({ items }) => (
  <dl className="os-kv">
    {items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
  </dl>
);

export const Icon = ({ name }) => (
  <svg className="os-icon" aria-hidden="true"><use href={`/icons.svg#os-${name}`} /></svg>
);
```

With a client-side framework, call `Oldschool.init(el)` in an effect for
components that need behaviors (tabs, sortable tables), or re-implement them — the
markup contract is documented in each CSS file's header comment.

## 6. Other platforms

`dist/tokens.json` contains every theme × mode fully resolved:

```json
{
  "seeds": { "accent": "#2a5aa8", "neutral": { "chroma": 0.008 }, … },
  "palette": { "accent": { "50": "#f1f6ff", …, "950": "#0a2146" }, "neutral": { "0": "#ffffff", … } },
  "themes": {
    "retro": {
      "roles": { "radius-panel": "0", "pad": "0.625rem", "font-body": "Verdana, …", … },
      "light": { "canvas": "#c0d6f9", "surface": "#ffffff", "link": "#2555a2", … },
      "dark":  { "canvas": "#111315", … }
    },
    "standard": { … }
  },
  "primitives": { "space": { "4": "1rem" }, … }
}
```

Feed it to Style Dictionary, Figma Tokens Studio, SwiftUI/Compose generators,
or email templates (use the `light` values inline).

## 7. With an AI coding agent

Tell it:

> Follow the design system in `oldschool-no`: read `DESIGN.md` for the rules
> and `site/components.html` / `src/css/components/*.css` headers for markup.
> Use only `--os-*` tokens; no raw colors or pixel font sizes. Every content
> block is an `.os-panel`. Colours come from the accent seed in `tokens/palette.mjs`.

`AGENTS.md` in this repo has the same instructions in more detail.

## Checklist for a new page

- [ ] `<html lang>`; `data-theme="standard"` if you want the tidier look
- [ ] `.os-page` body, skip link, masthead, footer with accessibility statement
- [ ] every content group in an `.os-panel` with a real heading
- [ ] facts in `.os-kv`, prices in `.os-price`, actions as icon + word
- [ ] detail pages: crumb bar with pager; phones: `.os-container--bleed` + `.os-mobilebar`
- [ ] wide tables: `.os-table--stack`, and `.os-container--wide` or `.os-layout--late`
- [ ] no hard-coded colors, sizes or shadows
