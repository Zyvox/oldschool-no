# JavaScript behaviors

Optional. Every component works without JavaScript; `oldschool.js` adds
comfort. It is ~26 kB unminified (~8 kB gzipped), has no dependencies, and
attaches to `data-os-*` attributes on `DOMContentLoaded`.

```html
<script src="dist/oldschool.js" defer></script>            <!-- classic, window.Oldschool -->
<script type="module" src="dist/esm/oldschool.js"></script> <!-- or as a module -->
```

After inserting markup dynamically, call `Oldschool.init(container)`.
Initialisation is idempotent per element.

## Data attributes

| Attribute | On | Behaviour |
|---|---|---|
| `data-os-gallery` | `.os-gallery` | prev/next and full-screen buttons, thumbnails scroll the picture, ←/→ keys, counter, lightbox |
| `data-os-gallery-open` | inside a gallery | opens the lightbox |
| `data-os-tabs` | `.os-tabs` | ARIA tabs: roles, roving tabindex, ←/→/Home/End |
| `data-os-toggle` | button | toggles `aria-pressed` |
| ↳ `data-os-label-pressed="…"` | | label text while pressed |
| ↳ `data-os-toast-pressed="…"` / `data-os-toast-released="…"` | | toast on change |
| ↳ `data-os-persist="key"` | | remember state in localStorage |
| `data-os-share` | button | native share sheet, else copies the URL (optional value = URL) |
| `data-os-copy="text"` | button | copies text (default: its own text); `data-os-copied="…"` custom toast |
| `data-os-print` | button | `window.print()` |
| `data-os-dialog="id"` | button/link | `showModal()` on `<dialog id>` |
| `data-os-view="#list"` | radio group | switches `.os-results` between list and `--grid` |
| `data-os-theme-control="theme\|mode\|density"` | select or radio group | reads/writes preferences |

## API

```js
Oldschool.init(root?)                    // enhance new markup
Oldschool.toast('Lagret', { icon: 'circle-check', duration: 3200 })
Oldschool.openLightbox([{ src, alt, caption }], startIndex)
Oldschool.theme.get()                    // { theme, mode, density }
Oldschool.theme.set({ theme: 'furu' })   // persists, syncs tabs/iframes
Oldschool.theme.resolvedMode()           // 'light' | 'dark'
Oldschool.register(name, selector, init) // add your own behavior to the registry
```

Events: `os:preferences` (on `document`, detail = preferences),
`os:tabchange` (on the tabs root, detail = `{ index, tab }`).

## Language

Built-in strings (gallery buttons, toasts) follow `<html lang>`: Norwegian for
`nb`, `nn`, `no`, English otherwise. The icon sprite path is read from
`<html data-os-icons="…/icons.svg">` or inferred from the first
`<use href="…#os-…">` on the page.

## Color engine

`src/js/color.js` (also `dist/esm/color.js`) is the OKLCH engine used by the
build and the theme generator: `accentRamp()`, `neutralRamp()`,
`oklchToHex()`, `hexToOklch()`, `contrastRatio()`. Pure functions, usable in
Node and the browser.

## Constraints for contributors

`scripts/lib/bundle.mjs` bundles `src/js` into the classic script without a
third-party bundler, so modules stick to named `export function/const/class`,
`export { a, b }`, and `import { a } from './x.js'` — no default exports, no
circular imports.
