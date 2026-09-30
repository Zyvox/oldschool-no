# AGENTS.md

Instructions for AI coding agents — both when working **in this repo** and
when **replicating this design in another repo**.

## Replicating Oldschool elsewhere

1. Read [DESIGN.md](DESIGN.md) first. It is the spec; the CSS is the reference implementation.
2. Prefer consuming the built files (`dist/`) over re-implementing. If you must
   re-implement (native, email, a framework without CSS files), take values from
   `dist/tokens.json` — never guess colors or sizes.
3. Markup contract per component: the header comment of `src/css/components/<name>.css`
   (collected in [docs/components.md](docs/components.md)), and live examples in `site/components.html`.
4. Non-negotiables:
   - every content group is an `.os-panel` on the canvas;
   - links in content are colored **and** underlined;
   - facts use `.os-kv` (label muted, value strong, tabular numbers);
   - one big number (price) per view; one primary button per view;
   - detail pages get breadcrumbs + result pager; phones get `.os-container--bleed` and `.os-mobilebar`;
   - only `--os-*` tokens — no hex values, px font sizes or ad-hoc shadows;
   - WCAG 2.2 AA: contrast, 44px controls, visible focus, labels, `lang`.

## Working in this repo

- Node ≥ 18, no runtime dependencies. `npm install` only for browser tests.
- **Never edit generated files**: `src/css/tokens/*.css`, `dist/**`, `docs/tokens.md`,
  `docs/components.md`, `site/assets/generated/*`. Edit `tokens/*.mjs`, `src/**`, then `npm run build`.
- Commit the regenerated `dist/` with your change (CI checks freshness).
- Before finishing: `npm test` (build + static checks), and if you touched
  components, layout or JS: `npm run smoke` and `npm run a11y`.

### Conventions

- CSS: flat selectors (no nesting), BEM `os-block__element--modifier`, logical
  properties, one component per file in `src/css/components/`, registered in
  `src/css/oldschool.css`, inside `@layer os.components`.
- A component file starts with a comment: purpose, minimal markup, variants.
  That comment becomes the docs.
- Components use role tokens (`--os-pad`, `--os-radius-panel`) and semantic
  colors (`--os-color-*`) only. Local knobs are `--os-<component>-*` with fallbacks,
  private ones `--_name`.
- Prefer `@container` queries to viewport media queries inside components.
  Breakpoints: 40em / 60em / 76em.
- JS: ES modules in `src/js/`, named exports only, no default exports, no
  circular imports (the tiny bundler in `scripts/lib/bundle.mjs` relies on this).
  Behaviors register with `register(name, selector, init)` and use `data-os-*` hooks.
  Everything must work without JS.
- Demo content is Norwegian (bokmål) on `listing.html` / `search.html`, English elsewhere.
  All people, brands and listings are fictional.
- New icon: copy the Lucide SVG into `src/icons/` and rebuild.

### Adding a component (checklist)

1. `src/css/components/<name>.css` with the header comment and `@layer os.components`.
2. `@import` it in `src/css/oldschool.css`.
3. A demo section in `site/components.html` (`<div class="hx-demo" data-demo>`), and a TOC link.
4. `npm run build && npm test && npm run smoke && npm run a11y`.
