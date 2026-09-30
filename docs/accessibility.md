# Accessibility

In Norway, *universell utforming* regulations make WCAG 2.1 AA (moving to
2.2) a legal requirement for most public-facing websites. Oldschool treats
WCAG 2.2 AA as the floor and tests it.

## Guaranteed by the tokens

`npm run check` computes contrast for 37 foreground/background role pairs in
every theme × light/dark (592 checks) and fails if any is below:

- 4.5:1 for all text roles (body, muted, subtle, links, visited, on-accent, status text on status backgrounds),
- 3:1 for control borders, focus ring and checked controls (WCAG 1.4.11, 2.4.13).

Because ramps are generated with fixed lightness, new themes made with the
generator inherit these margins — and the check proves it.

## Guaranteed by the components

- **Focus**: `:focus-visible` ring 2px `--os-color-focus` + 2px offset (3px in `kontrast`), never removed.
- **Targets**: controls are 44px (`--os-control-height`); inline links in lists get 24px minimum (WCAG 2.5.8).
- **Links** are underlined in content and distinguishable without color.
- **Forms**: always-visible labels; hints/errors via `aria-describedby`; `aria-invalid` styling; errors have an icon and text.
- **Custom checkboxes/radios/switches** return to native rendering in forced-colors mode.
- **Icon-only controls** carry `aria-label`; decorative icons are `aria-hidden`.
- **Tabs, dialogs, lightbox** follow WAI-ARIA patterns; Escape closes; focus returns.
- **Gallery** slides have "Bilde n av N" labels; the track is keyboard operable.
- **Reduced motion**: all durations become 0; smooth scrolling is disabled.
- **Zoom and font size**: rem/em everywhere; media queries in em; reflows at 320px.
- **Print**: a dedicated print stylesheet (the original had "Skriv ut" for a reason).
- **No-JS**: menus and filter sheets use the popover API, galleries use scroll-snap and anchors.

## Tested in a browser

`npm run a11y` runs axe-core (WCAG 2.0–2.2 A/AA + best practices) on every
showcase page in six variants (fjord light/dark, phone width, kontrast,
retro, tyttebær dark on phone). `npm run smoke` checks keyboard behaviour of
the gallery, lightbox, tabs and dialog, preference persistence, popovers, and
horizontal overflow at 360px.

## Your responsibilities

Tokens and components can't fix content. Keep:

- one `<h1>` per page and a logical heading order,
- meaningful `alt` on content images (`alt=""` for decorative duplicates such as gallery thumbnails),
- `lang` on `<html>` (and on inline passages in another language),
- an accessibility statement link in the footer (*tilgjengelighetserklæring*),
- link text that makes sense out of context ("Se alle 12 bilder", not "Klikk her").
