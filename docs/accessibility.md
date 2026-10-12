# Accessibility

In Norway, *universell utforming* regulations make WCAG AA a legal requirement
for most public-facing websites. Oldschool treats WCAG 2.2 AA as the floor and
tests it on every build.

## Guaranteed by the tokens

`npm test` resolves 46 foreground/background pairs for every theme × light/dark
× normal/more contrast (368 checks) and fails if any is below:

- 4.5:1 for every text role — body, muted, subtle, links, visited, text on
  buttons and status fills, status text on status backgrounds, text on the
  frame, the crumb bar, header bands, tabs and zebra rows;
- 3:1 for control borders, the focus ring and checked controls (WCAG 1.4.11, 2.4.13).

Ramps are generated with fixed lightness per step, so any accent seed inherits
these margins — and the check proves it for the seed you choose.

## Guaranteed by the components

- **Focus**: a `:focus-visible` ring (2px, 3px with more contrast) in
  `--os-color-focus`, never removed.
- **Targets** (2.5.8): buttons and inputs are at least 24px tall (30px in the
  standard theme, 44px with `data-density="comfortable"`). Link lists, tag
  clouds, teasers, utility links and the A–Å index keep links 24px apart; the
  error summary pads its links to 24px.
- **Links** are underlined in content, so they never depend on colour alone.
- **Status** is a dot *and* a word; badges are words.
- **Forms**: always-visible labels; hints and errors via `aria-describedby`;
  `aria-invalid` styling; errors in text; `.os-errorsummary` with links to each field.
- **Tables** are real tables: `scope` on headers, `aria-sort` on sorted
  columns, a focusable scroll region with a label. Stacked tables keep a label
  on every value.
- **Tabs and dialogs** follow the WAI-ARIA patterns; Escape closes dialogs.
- **More contrast**: `prefers-contrast: more` darkens muted text and rules,
  thickens link underlines and the focus ring.
- **Reduced motion**: every duration becomes 0.
- **Zoom and font size**: rem/em everywhere, media queries in em, reflow at 320px.
- **No JavaScript needed**: menus and filter sheets use `popover`, disclosures
  use `<details>`, tabs fall back to headed sections.
- **Print**: a print stylesheet drops navigation and prints link targets.

## Tested in a browser

`npm run a11y` runs axe-core (WCAG 2.0–2.2 A/AA + best practices) on every
showcase page in nine variants: standard light, dark, phone width and compact;
retro light, dark on a phone, and comfortable + wide; standard with
`prefers-contrast: more`; standard dark on the wide page. `npm run smoke` checks tabs, sorting, stacked
tables, dialogs, toggles, preference persistence, popovers, menus,
notifications, the carousel, the accent playground and horizontal overflow at 360px.

## Your responsibilities

Tokens and components can't fix content. Keep:

- one `<h1>` per page and a logical heading order;
- `lang` on `<html>`, and on passages in another language;
- unique names for landmarks and scroll regions (`aria-label` on
  `.os-table-wrap` should not repeat its box's title);
- link text that makes sense out of context ("Se alle 12 treff", not "Klikk her");
- an accessibility statement in the footer (*tilgjengelighetserklæring*);
- the error summary in focus after a failed submit.
