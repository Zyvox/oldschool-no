# Oldschool — design spec

This is the spec. The CSS in `src/css` is the reference implementation, and
`dist/tokens.json` holds every value. When this file and the code disagree,
fix one of them.

## 1. Intent

The practical Norwegian web of 2006–2011 — portals, classifieds,
municipalities, newspapers — **kept as it was**: a tinted frame around white
boxes with header bands, small utility links top right, folder tabs, bold
breadcrumbs, a result pager, blue underlined links, facts as *label : value*,
one big price, grey buttons and one blue one. Text first; no image is ever
required.

Only what dates it is fixed:

| Then | Now | Why |
| --- | --- | --- |
| Hand-picked, saturated colours | Every shade grown from one accent seed in OKLCH | Re-brand with one line; contrast stays guaranteed |
| Verdana 11px | Verdana 12px (retro) or Arial 14px (standard) | Readable without zooming |
| 16–18px buttons and links | 24px minimum targets | WCAG 2.2 target size |
| Contrast by luck | WCAG 2.2 AA checked on every build | Universell utforming is the law |
| Table layout, a fixed 1000px page | Grid, container queries; 1000px or 1200px wide; phones | Works from 320px to 16:9 screens |
| Light only | Light and dark, three densities, more-contrast mode | Follows the visitor's settings |

Two themes share all markup:

- **`retro`** — the default: Verdana 12px, the saturated frame (`frame.200`),
  square corners, no outline around boxes, tight spacing (8px gaps, 10px padding).
- **`standard`** — tidied: Arial 14px, a paler frame (`frame.100`), 3px
  corners, hairline box outlines, a one-pixel bevel, 10/12px spacing.

Use `standard` when a page is read for long stretches; `retro` for everything
else. Never mix them on one page except to compare.

## 2. Page anatomy

```
┌ frame (canvas) ──────────────────────────────────────────────────────────────┐
│ [■ oldschool kultur]                      Kundeservice | Ny annonse | Logg inn │  masthead
│ [Forside][Nyheter][Kultur][Tjenester]                                          │  tab bar (optional)
│ ┌ crumb bar ─────────────────────────────────────────────────────────────────┐ │
│ │ Kultur / Konserter / Høstjazz                    < Forrige  3 av 128  Neste > │ │
│ └────────────────────────────────────────────────────────────────────────────┘ │
│ ┌ main ──────────────────────────────────────┐  ┌ aside 300px ──────────────┐ │
│ │ actions · meta                             │  │ summary: price + facts    │ │
│ │ H1 title / subtitle                        │  ├───────────────────────────┤ │
│ │ link row                                   │  │ contact box               │ │
│ ├────────────────────────────────────────────┤  ├───────────────────────────┤ │
│ │▒ Praktisk informasjon ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  │ schedule                  │ │
│ │ label : value rows                         │  └───────────────────────────┘ │
│ └────────────────────────────────────────────┘                               │
│ footer (on the frame)                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Container**: 1000px (`--os-container-width`) centred on the frame, plus a
  12px gutter. App pages with wide tables use `.os-container--wide` (1200px).
- **Columns** (`.os-layout`), from 60em: main + 300px aside (detail pages);
  `--start`: 200px menu + main (search, self-service); `--three`: menu + main +
  aside (front pages); `--late`: like the default but the aside only moves up
  from 76em, so tables get the full width on laptops. Below 60em every column
  stacks: nav, main, aside.
- **Gaps**: `--os-gap` between boxes, `--os-pad` inside them.

### Phones and tablets

One codebase; no separate mobile site.

- Below 40em, `.os-container--bleed` runs boxes edge to edge (no side
  borders, no radius); the masthead links fold into a popover menu.
- Breadcrumbs collapse to "‹ parent"; the pager keeps "3 av 128".
- Below 60em the aside drops under the content, and `.os-mobilebar` repeats the
  key figure and the primary action at the bottom of the screen.
- Search filters become a sheet opened by "Avgrens (2)" — a `popover`, no JS.
- Tables with `.os-table--stack` become label/value boxes when their container
  is under 36em, instead of scrolling sideways.

Components respond to their **container** wherever possible: `.os-panel`,
`.os-table-wrap` and `.os-thread` are size containers.

## 3. Colour

Components use semantic colours only. Ramps are an implementation detail.

| Role | Light | Dark | Used for |
| --- | --- | --- | --- |
| `canvas` | frame.200 (retro) / frame.100 | neutral.1000 | the frame |
| `surface` | white | neutral.950 | boxes, inputs |
| `panel-header`, `crumbbar` | frame.100, frame.50 | frame.950 | header bands, crumb bar |
| `text` / `text-strong` | neutral.900 / 1000 | neutral.50 / 0 | body / headings, values, prices |
| `text-muted` | neutral.700 (retro) / 600 | neutral.400 | labels, meta — ≥ 4.5:1 on every surface |
| `link` / `link-visited` | accent.700 / visited.700 | accent.300 / visited.300 | links |
| `accent` | accent.600 | accent.400 | the primary button, checked controls, focus |
| `border-strong` | neutral.400 | neutral.500 | form controls — ≥ 3:1 |
| success · warning · danger · info | 700 text, 50 bg, 200 border, 600 fill | 300 / 950 / 800 / 400 | messages, badges, status |
| `highlight` | note.100 | note.950 | `<mark>`, the yellow notice |

`frame` is the accent ramp unless `tokens/palette.mjs` sets a frame seed.
Full list with values: [docs/tokens.md](docs/tokens.md). How the ramps are
made and how to change them: [docs/theming.md](docs/theming.md).

Rules:

1. **One accent.** It marks what is interactive or selected. Status colours are for status only.
2. **Hierarchy by weight and size**, not colour. Headings are `text-strong`, not accent.
3. **Links are coloured and underlined** wherever they sit in content. Visited links turn purple.
4. **Colour is never the only signal**: status dots come with a word, errors with text.
5. **One seed.** Re-brand by changing `accent` in `tokens/palette.mjs`; never by editing ramps or hex values.
6. **The frame is the accent or a near-grey.** `frame` is `null` by default, so
   the frame, bands, tabs and zebra rows come from the accent (the 2008 look).
   A near-grey `frame` seed (stone, steel, grey) gives the modern look with
   the colour only on what you can click. Never a second strong colour.

## 4. Type

- **Families**: Verdana (retro body) or Arial (standard, and headings in both),
  from the system. No web fonts. Courier New for code.
- **Fixed pixel steps**, no fluid type:

  | Token | Standard | Retro | Use |
  | --- | --- | --- | --- |
  | `text-2xs` | 11px | 10px | badges |
  | `text-xs` | 12px | 11px | meta, captions, utility links |
  | `text-sm` | 13px | 11px | secondary text, tables, labels |
  | `text-md` | 14px | 12px | body (`--os-text-body`) |
  | `text-lg` | 16px | 14px | box titles |
  | `text-3xl` | 24px | 20px | page title |
  | `text-4xl` | 30px | 24px | the key figure |

- Bold (700) for headings, box titles, values and prices; regular otherwise.
- Line length ≤ `--os-measure` (72ch) for running text.
- Numbers in tables and facts use tabular figures. Norwegian formats: `7 500,-`,
  `11.10.2026`, `kl. 19:00`.

## 5. Shape, space and elevation

- 4px grid. Retro: 8px gaps, 10px padding, 4px rows. Standard: 10 / 12 / 5px.
- Corners: 0 (retro) or 3px (standard); folder tabs 4px on top only.
- Boxes are flat. Shadows only on menus, popovers and dialogs.
- Rules: 1px. Hairlines inside boxes use `border-subtle`.
- Controls: 24px (retro) / 30px (standard) tall; 44px with `data-density="comfortable"`.

## 6. Components

62 components; markup for each in [docs/components.md](docs/components.md),
live in `site/components.html`.

| Group | Components |
| --- | --- |
| Page chrome | skip link, masthead, brand, utility links, menu, tab bar, sub nav, crumb bar, breadcrumbs, pager, side menu, A–Å index, footer, mobile bar, bleed |
| Content | box (`os-panel`), heading, meta, action row, link row, facts (`os-kv`), key figure, summary, contact box, link list, teasers, tags, checklist, schedule, prose, stats, progress, table, toolbar, bars (poll), calendar, log, thread, files, output, empty state, icon |
| Controls | button, forms, choices, segmented choice, search box, filters, chips, steps, tabs, disclosure, pagination, search results, dialog |
| Feedback | badge, status, score, notices (`os-alert`, `os-note`), error summary, toast, notification (corner window or centred over the page) |

Rules that hold across them:

- **Everything lives in a box.** Loose text on the frame is only for the masthead, crumb bar and footer.
- **One primary button and one key figure per view.**
- **Two button styles, one component.** `.os-button` is the retro button
  (gradient, highlight). `.os-button--flat` — or `data-buttons="flat"` on a
  page or section — is the plain one for app screens: solid primary, white
  secondary with a rule, `--ghost` for "··· Mer". Pick one style per page.
  Tabs come the same way: folder tabs (default) or `.os-tabs--line`.
- **Facts are `.os-kv`** — label muted, value strong — never a sentence.
- **Detail pages** get breadcrumbs and a result pager in the crumb bar.
- **Tables**: numbers right-aligned (`.os-num`), cells centred vertically, the
  row's name in `.os-table__title`, buttons in `.os-table__actions`, state as
  `.os-status`; add `.os-table--stack` when a table has more than four columns.
  More than two row actions go in a "Mer ▾" `.os-menu`; wide tables get
  `--sticky` so the actions stay in view. Cap free-text columns
  (`.os-table__cap`) so one long value cannot blow the table up.
- **Server-rendered views** of one list (Kandidater / Avvist / Alle) are
  `.os-tabs--nav` link tabs with `aria-current="page"`, not ARIA tabs.
- **Forms**: label column on wide screens, label above on narrow; hints under
  the field; errors as text linked with `aria-describedby`, and an
  `.os-errorsummary` at the top after a failed submit.

## 7. Accessibility

WCAG 2.2 AA is a requirement, not a goal; see [docs/accessibility.md](docs/accessibility.md).
Contrast is checked for every pair in both themes, both modes and
more-contrast mode on every build; every page is audited with axe in eight
variants.

## 8. Non-negotiables for re-implementations

- Only `--os-*` tokens (or values from `dist/tokens.json`): no hex values, px font sizes or ad-hoc shadows.
- The frame, the white boxes and the header bands.
- Underlined links; purple visited links.
- Breadcrumbs on every page below the front page.
- Everything works without JavaScript and without images.
- `lang` on `<html>` and on any block in another language.
