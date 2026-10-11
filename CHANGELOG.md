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
- Showcase: an app dashboard (`jobs.html`), an accent playground and recipes on
  the themes page, width switch in the harness bar; images and Inter removed.

## 0.1.0 — 2026-09-30

First release of the harness (modern Nordic finish, eight colour themes, Inter, image gallery).
