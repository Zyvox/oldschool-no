# Adopting Oldschool in another repo

Pick the lightest option that fits.

## 1. Copy the built files (any stack)

Copy `dist/` (or the pieces you need) into your static assets:

```
dist/oldschool.css      all tokens, themes and components (or .min.css)
dist/oldschool.js       optional behaviors (classic script)
dist/icons.svg          icon sprite — reference as icons.svg#os-<name>
dist/fonts/inter/       Inter; paths are relative to oldschool.css
```

Keep `oldschool.css` and `fonts/` in the same relative position, or override
`--os-font-body` to use a different font.

## 2. Install from Git

```bash
npm install github:Zyvox/oldschool-no
```

```js
import 'oldschool-no/css';                  // dist/oldschool.css
import { toast, theme } from 'oldschool-no'; // dist/esm (auto-initialises on import)
import tokens from 'oldschool-no/tokens.json' with { type: 'json' };
```

`src/css/*` is importable too if you want only some layers, e.g. tokens + base
+ panel + kv.

## 3. Tailwind

**v4** — CSS-first:

```css
@import "tailwindcss";
@import "oldschool-no/dist/oldschool.css";
@import "oldschool-no/dist/tailwind.css";
```

```html
<div class="bg-surface border border-line rounded-panel p-pad text-fg">
  <p class="text-fg-muted text-sm">Leie pr. mnd.</p>
  <p class="text-price text-3xl font-bold tabular-nums">7 500 kr</p>
  <a class="text-link underline">Forbrukslån</a>
</div>
```

Semantic colors are renamed to avoid `text-text-…`: `text` → `fg`,
`text-muted` → `fg-muted`, `border` → `line`, `text-on-accent` → `on-accent`.
All utilities follow `data-theme` / `data-mode` because they point at the
CSS variables.

**v3** — `presets: [require('oldschool-no/dist/tailwind-preset.cjs')]`.

## 4. Component frameworks

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
components that need behaviors (gallery, tabs), or re-implement them — the
markup contract is documented in each CSS file's header comment.

## 5. Other platforms

`dist/tokens.json` contains every theme × mode fully resolved:

```json
{
  "themes": {
    "fjord": {
      "roles": { "radius-panel": "8px", "pad": "clamp(…)", … },
      "light": { "canvas": "#eaeff4", "surface": "#ffffff", "link": "#1e56a1", … },
      "dark":  { "canvas": "#0f1317", … }
    }
  },
  "palette": { "fjord": { "50": "#f0f7ff", … } },
  "primitives": { "space": { "4": "1rem" }, … }
}
```

Feed it to Style Dictionary, Figma Tokens Studio, SwiftUI/Compose generators,
or email templates (use the `light` values inline).

## 6. With an AI coding agent

Tell it:

> Follow the design system in `oldschool-no`: read `DESIGN.md` for the rules
> and `site/components.html` / `src/css/components/*.css` headers for markup.
> Use only `--os-*` tokens; no raw colors or pixel font sizes. Every content
> block is an `.os-panel`. Run the contrast rules in DESIGN.md §9.

`AGENTS.md` in this repo has the same instructions in more detail.

## Checklist for a new page

- [ ] `<html lang>` and optionally `data-theme`
- [ ] `.os-page` body, skip link, masthead, footer with accessibility statement
- [ ] every content group in an `.os-panel` with a real heading
- [ ] facts in `.os-kv`, prices in `.os-price`, actions as icon + word
- [ ] detail pages: crumb bar with pager; phones: `.os-container--bleed` + `.os-mobilebar`
- [ ] no hard-coded colors, sizes or shadows
