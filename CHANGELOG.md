# Changelog

## 0.3.0 — 2026-10-12

The look of a real app built on Oldschool (Utkikk) is now the default: the
2008 layout with today's controls. Retro becomes the alternative.

- **`standard` is the default theme** and takes over v0.1's "Retro 2011"
  look: Arial 13px, the saturated frame, square boxes without an outline, 8px
  gaps, 12px padding, 30px controls with 3px corners, muted text at
  `neutral.700`. The old tidier standard (Arial 14px, paler frame, 3px boxes,
  hairlines, bevel) is gone. `retro` keeps Verdana 12px and 24px square
  controls, and its buttons are the bevelled gradient.
- **Flat buttons by default.** `.os-button` is flat (solid primary, white
  secondary with a rule). The 2008 gradient comes with the retro theme, or
  anywhere with `.os-button--retro` or `data-buttons="retro"`; `--flat` and
  `data-buttons="flat"` switch back. The nearest setting wins (role token
  `--os-button-retro`, 0 or 1).
- **Line tabs by default.** `.os-tabs` is the underlined style; the folder
  tabs are `.os-tabs--folder`. `.os-tabs--line` is gone (it is the default).
- **Carousel** (`.os-carousel`): scroll-snap swipe, one picture per view with
  `object-fit: contain` on the sunken surface, ‹ › buttons (dimmed at the
  ends, hidden on touch-only screens), an "n / total" counter, arrow keys and
  Home/End, an optional thumbnail strip with `aria-current`. Works as a
  swipeable strip with link thumbnails without JS.
- `.os-status--running` pulses slowly (still with reduced motion).
- `.os-panel__body--flush` takes the padding off one box body.
- `.os-table__sort` takes the header's colour and underlines on hover.
- **Recipe** "Portal grey": the portal blue on a steel-grey frame.

### Replacing local copies in an app

| Local class or code | Oldschool 0.3 |
| --- | --- |
| `u-notify` | `Oldschool.notify({ title, message, tone, actions, duration })`, or `.os-notification` in an `.os-toaster.os-toaster--corner` (`data-os-autohide`, `data-os-dismiss`) |
| `u-thumbcell`, `u-thumb`, `u-thumb--none` | `.os-table__thumb` with an `<img>` or `.os-table__noimg` |
| `u-titlecell`, `u-textcell` | `.os-table__cap`, `.os-table__cap--wide` (and `.os-table__title` for the row's name) |
| `u-clamp` | `.os-clamp`, lines in `--os-clamp` (default 2), full text in `title` |
| `u-actions-col` | `.os-table--sticky` on the table, `.os-table__actions` on the cells |
| `u-sort` | `.os-table__sort` links, `aria-sort` on the `<th>` |
| `u-items thead th` (bottom-aligned) | built in: headers sit at the bottom of the header row |
| `tr.u-fail`, `tr.u-hl` | `.os-table__row--danger`, `.os-table__row--highlight` |
| `u-score` (`--good`, `--mid`, `--bad`, `--none`) | `.os-score` with the same tones |
| `os-badge--dot` for job state | `.os-status` (`--running`, `--success`, `--warning`, `--danger`) |
| `u-carousel` | `.os-carousel` |
| `u-pre` | `.os-pre-line` |
| `u-columns` | `.os-multicol` |
| `u-log` | `.os-output` (`.os-log` is the event list) |
| `u-small`, `u-muted`, `u-nowrap` | `.os-text-sm`, `.os-text-muted`, `.os-nowrap` |
| `u-up`, `u-down` | `.os-text-danger` / `.os-text-success` with a visually hidden "Opp" / "Ned" |
| `data-ready` written into link tabs | `.os-tabs--nav` (no `data-ready`, no JS) |
| the script that places `.os-menu` under its button | built into oldschool.js |
| `../src/fonts/…` URLs in `dist/` | no web fonts any more: Arial and Verdana from the system |

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
