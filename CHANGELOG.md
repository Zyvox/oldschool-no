# Changelog

## 0.2.0 — 2026-10-11

The design is back to the 2008 original. Breaking changes throughout.

- **Two themes**: `retro` (the default — Verdana 12px, saturated frame, square
  corners) and `standard` (Arial 14px, paler frame, 3px corners). The eight
  colour themes and `kontrast` are gone; `prefers-contrast: more` is honoured instead.
- **One accent seed**: `tokens/palette.mjs` now holds seeds (a hex colour or
  `{ hue, chroma }`), and every ramp is generated from them. Ramps are emitted
  once as `--os-accent-*`, `--os-neutral-*` and the status steps in use; the
  named palette ramps (`--os-blaa-*` …) are removed.
- **Smaller output**: no `light-dark()` fallback, no theme ramp aliases, layer
  blocks merged, a better minifier; new `dist/oldschool.min.js`. CSS 14 kB gzip
  with 59 components (was 16 kB with 50), JS 4.5 kB gzip.
- **Tables**: cells centred vertically; `.os-table__title`, `.os-table__actions`,
  `--top`, and `--stack` (rows become label/value boxes in narrow containers;
  labels filled in from the headers by oldschool.js).
- **Widths and layout**: `.os-container--wide` / `data-width="wide"` (1200px),
  `.os-layout--late` (aside joins from 76em). `width` is a preference in
  `Oldschool.theme`.
- **New components**: status, toolbar, bars (poll), calendar, log, thread,
  files, error summary, A–Å index.
- **Accessibility**: 24px targets for list links, tags, teasers and utility
  links; contrast checked in more-contrast mode too (368 pairs); axe in 8 variants.
- `data-os-copy="#id"` copies the text of that element.
- From use in a real app: `.os-table--sticky` (actions column pinned to the
  right edge, following zebra, hover and row states), `.os-table__cap` /
  `--wide`, `.os-table__thumb` (+ `.os-table__noimg`), row states
  `.os-table__row--danger` / `--highlight`, bottom-aligned headers for
  two-line `<br>` headers, server-side sort links with `.os-table__sort`;
  `.os-tabs--nav` link tabs with `.os-tabs__count`; `.os-score`;
  `.os-output`; utilities `.os-clamp`, `.os-pre-line`, `.os-multicol`.
- Two button styles: `.os-button--flat` (solid primary, white secondary with a
  rule, no gradient) per button or `data-buttons="flat"` for every button in a
  section or page, plus `.os-button--ghost`. Line tabs: `.os-tabs--line`. The
  App demo page uses both.
- Notifications: `Oldschool.notify()` and `.os-notification` — a small
  window with a tone-coloured title bar and close box, stacked in the bottom
  corner (above the mobile bar on phones), or centred over a dimmed page with
  `placement: 'center'` / `--center` (a light-dismiss popover). Timers pause on
  hover and focus; Escape closes; danger uses `role="alert"`. Toasts and
  notifications keep their order and speak in polite live regions.
- `.os-menu` popovers open under their button in every browser and when
  opened with `showPopover()` (oldschool.js), with a 4px gap.
- Fixed: visually hidden text in table cells widened the page on phones
  (`.os-table-wrap` is now `position: relative`).
- **Frame seed**: `frame` in `tokens/palette.mjs` (default `null` = the accent)
  colours the frame, header bands, crumb bar, inactive tabs and zebra rows
  through a new `frame` ramp; a near-grey frame gives a modern look with the
  accent only on what you can click. The greys follow the frame's hue.
- **Recipes** in `tokens/recipes.mjs`, checked by `npm test`: Portal blue
  (default), Forest, Fjord, Clay, Indigo and Graphite. Burgundy, Amber,
  Heather, Teal and Slate are gone.
- Showcase: an app dashboard (`jobs.html`), an accent playground (with a frame
  choice) and recipes on the themes page, width switch in the harness bar;
  images and Inter removed.

## 0.1.0 — 2026-09-30

First release of the harness (modern Nordic finish, eight colour themes, Inter, image gallery).
