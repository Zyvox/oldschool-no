# JavaScript

Optional. Every component works without JavaScript; `oldschool.js` adds
keyboard support, sorting, a few conveniences and the preference switch.
5 kB gzipped.

```html
<script src="dist/oldschool.min.js" defer></script>          <!-- classic script, window.Oldschool -->
<script type="module" src="dist/esm/oldschool.js"></script>  <!-- or as ES modules -->
```

Behaviors attach on `DOMContentLoaded` to `data-os-*` hooks. After inserting
markup, call `Oldschool.init(container)`.

## Hooks

| Attribute / selector | On | Does |
| --- | --- | --- |
| `data-os-tabs` | `.os-tabs` | WAI-ARIA tabs: roles, arrow keys, Home/End; without JS every panel shows under its own heading |
| `data-os-sort` | `table.os-table` | header cells become sort buttons with `aria-sort`; `7 500,-`, `12,5 %` and `11.10.2026` sort as numbers; `data-os-nosort` on a `<th>` opts out; `data-sort-value` on a cell overrides its text |
| `.os-table--stack` | `table` | copies each header's text (or its `title`) into `data-label` on cells that have none, for the stacked phone layout |
| `.os-menu[popover]` | the menu | places it under its `popovertarget` button — start-aligned, end-aligned when there is no room, flipped above when there is no room below — and follows scrolling. CSS anchor positioning does the same without JS where supported; this covers other browsers and `showPopover()` from script |
| `data-os-toggle` | `<button>` | `aria-pressed` on/off; `data-os-label-pressed`, `data-os-toast-pressed`, `data-os-toast-released`, `data-os-persist="key"` |
| `data-os-dialog="id"` | any button | opens `<dialog id>` with `showModal()` |
| `data-os-copy` | `<button>` | copies its value, the text of `#id` when the value is `#id`, or its own text — then a toast |
| `data-os-share` | `<button>` | native share sheet, or copies the link |
| `data-os-print` | `<button>` | prints the page (there is a print stylesheet) |
| `data-os-theme-control="theme \| mode \| density \| width"` | `<select>` or a radio group | reads and sets the preference |

## API

```js
Oldschool.toast('Lagret!')                       // the yellow note, in a polite live region
Oldschool.theme.set({ theme: 'standard' })       // also mode, density, width; persists, syncs tabs/iframes
Oldschool.theme.get()                            // { theme, mode, density, width }
Oldschool.theme.resolvedMode()                   // 'light' | 'dark'
Oldschool.init(element)                          // enhance markup added later
Oldschool.register(name, selector, init)         // add your own behavior to the registry
```

Events: `os:preferences` on `document` (detail = preferences) and
`os:tabchange` on the tabs root (detail = `{ index, tab }`).

## Language

Built-in strings (toasts) follow `<html lang>`: Norwegian for `nb`, `nn`,
`no`, English otherwise. The icon sprite path is read from
`<html data-os-icons="…/icons.svg">` or inferred from the first
`<use href="…#os-…">` on the page.

## Colour engine

`dist/esm/color.js` is the OKLCH engine the build uses: `schemeFromSeeds()`,
`seedSpec()`, `accentRamp()`, `neutralRamp()`, `oklchToHex()`, `hexToOklch()`
and `contrastRatio()`. Pure functions, usable in Node and the browser — the
accent playground on the themes page runs on it. It is not part of
`oldschool.js`.

## Constraints for contributors

`scripts/lib/bundle.mjs` bundles `src/js` into the classic script, and
`minifyJs()` strips comments and indentation, without a third-party tool. So
modules stick to:

- named `export function/const/class`, `export { a, b }`, `import { a } from './x.js'`;
- no default exports, no circular imports;
- no regex literals containing quotes or comment markers.

`npm run smoke` runs the minified bundle in Chromium.
