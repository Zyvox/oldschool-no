# Changelog

## 0.1.0 — 2026-09-30

First release of the harness.

- Token pipeline: OKLCH palette generator, foundation scales, semantic colors
  with `light-dark()` + light-only fallback, role tokens, density modes.
- Themes: fjord (default), furu, lyng, nordlys, bjork, tyttebaer, retro, kontrast — each in light and dark.
- 49 component stylesheets in cascade layers; layout shell and primitives; print stylesheet.
- Behaviors: gallery + lightbox, tabs, toggles, toasts, share/copy/print, dialogs, view switch, theme preferences.
- Outputs: `dist/oldschool.css` (+ min), `dist/oldschool.js` (classic) and `dist/esm/`, icon sprite,
  Inter fonts, `tokens.json`, Tailwind v3 preset and v4 bridge.
- Showcase: listing, search, components, tokens, themes + generator, device preview.
- Quality: contrast gate (592 pairs), token/class/HTML integrity, axe audits, smoke tests, CI.
