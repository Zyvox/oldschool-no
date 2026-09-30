# Oldschool — design specification

> The canonical description of the Oldschool look and behaviour. If you are
> re-implementing it in another stack (React, Vue, native, email, a slide
> deck), this document plus [`dist/tokens.json`](dist/tokens.json) is enough.
> The CSS in `src/css/` is the reference implementation.

Oldschool is the page structure of mid-2000s Scandinavian classifieds
(the 2011 FINN.no listing page is the reference) — practical, dense,
readable — rebuilt with a modern Nordic finish. **Keep the structure. Modernise
the surface.**

---

## 1. Principles

| # | Principle | In practice |
|---|---|---|
| 1 | **Content first, chrome last** | The page is a document. No hero banners, no decorative imagery in functional views. |
| 2 | **Boxes on a calm canvas** | Group related information in white *panels* on a lightly tinted *canvas*. The gap between panels does the separating. |
| 3 | **Links look like links** | Link colour **and** underline in all content. Visited links change colour in result lists and running text. |
| 4 | **Label : value** | Facts are key/value rows: quiet label, strong value, hairline between rows, tabular numbers. |
| 5 | **The important number is big** | One figure per view (price, total) is set large and bold. Nothing else competes. |
| 6 | **Always know where you are** | Breadcrumbs + "result 3 of 128" + previous/next on every detail page. |
| 7 | **Actions are words** | Icon + text. Icon-only only when space forces it, always with an accessible name. |
| 8 | **Say the essentials twice** | Price and contact appear in the main column *and* in the aside (desktop) / bottom bar (phone). |
| 9 | **Lagom** | One accent colour. Flat surfaces, hairlines over shadows. Motion only to explain a change. |
| 10 | **Universal design** | WCAG 2.2 AA is the floor (in Norway it is the law — *universell utforming*). |
| 11 | **Swap, don't fork** | Every visual decision is a token. Brands change ramps, not components. |
| 12 | **Works without the extras** | Without JavaScript, every page still navigates, filters and shows images. |

### What "modern Nordic" changes from 2011

| 2011 original | Oldschool |
|---|---|
| Verdana/Arial 11–13px | Inter (variable, optical sizing) 16px body, fluid headings |
| Saturated blue frame | Near-neutral canvas (`neutral-100`), a whisper of the accent |
| No panel borders, square corners | 1px hairline borders, 8px radius, no shadows |
| Bright header bands | Very light accent tint (`accent-50`) bands with a hairline |
| Full-strength underlines | Underlines at 45% of the link colour, full on hover |
| Fixed 730px width | Fluid up to 1216px, main column + 360px aside |
| Desktop only | Mobile-first: sheets, sticky contact bar, collapsible crumbs |
| — | Dark mode, 8 themes, compact density, print stylesheet |

The `retro` theme reconstructs the original from the same markup — use it to
check that a change preserves the structure.

---

## 2. Page anatomy

```
┌ canvas ────────────────────────────────────────────────────────────┐
│ [■ brand  product]                    Kundeservice | Ny annonse | Logg inn │  masthead (on canvas)
│ ┌ crumb bar ─────────────────────────────────────────────────────┐ │
│ │ Forsiden / Eiendom / Oslo               ‹ Forrige  3 av 128  Neste › │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ┌ main ───────────────────────────────┐  ┌ aside (22.5rem) ─────┐ │
│ │ actions · meta · refcode            │  │ summary: price + kv  │ │
│ │ H1 title / subtitle / key facts     │  ├──────────────────────┤ │
│ │ gallery (picture + 2×2 thumbs)      │  │ contact card         │ │
│ │ link row                            │  ├──────────────────────┤ │
│ ├─────────────────────────────────────┤  │ viewing / schedule   │ │
│ │▒ Prisinformasjon ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  ├──────────────────────┤ │
│ │ price, key/value rows               │  │ address + map        │ │
│ ├─────────────────────────────────────┤  └──────────────────────┘ │
│ │▒ Fakta om boligen ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│                           │
│ │ key/value in auto columns           │                           │
│ └─────────────────────────────────────┘                           │
│ footer                                                             │
└────────────────────────────────────────────────────────────────────┘
```

- **Canvas** `--os-color-canvas`, **panels** `--os-color-surface`, gap `--os-gap` (12–20px fluid).
- **Container** max `--os-container-width` (76rem = 1216px) + `--os-gutter` (16–24px).
- **Two columns** from 60em (960px): `minmax(0, 1fr) 22.5rem`. Below: one column, aside after main.
- **Search pages** flip it: 17rem filter sidebar on the left (`.os-layout--start`).

### Phones (below 40em / 640px)

- Panels become **edge-to-edge sheets** (`.os-container--bleed`): no gutter, no radius, no side borders.
- Breadcrumbs collapse to one "‹ parent" link; pager to icon buttons + "3 av 128".
- Actions become 44px round icon buttons (labels kept for screen readers).
- The gallery becomes a swipe carousel with a "1 / 6" counter.
- Link rows become full-width list rows with chevrons.
- A **mobile bar** fixed at the bottom repeats price + primary actions (below 60em).
- Filters move into a **sheet** (`popover`) opened by "Filtrer (3)"; menus into a popover.

Components adapt to their **container**, not the viewport, wherever possible
(`.os-panel`, `.os-gallery` and `.os-results` are size containers).

---

## 3. Colour

### Roles (use these, never raw ramps)

| Role | Light | Dark | Used for |
|---|---|---|---|
| `canvas` | neutral-100 | neutral-1000 | page background |
| `surface` | white | neutral-950 | panels, inputs |
| `surface-tint` | accent-50 | accent-950 | panel header bands, selected rows |
| `text` / `text-strong` | neutral-900 / 1000 | neutral-50 / 0 | body / headings, values, prices |
| `text-muted` | neutral-600 | neutral-400 | labels, meta (≥ 4.5:1 everywhere) |
| `link` | accent-700 | accent-300 | links (≈ 7:1 on white) |
| `link-visited` | visited-700 | visited-300 | visited links (heather by default) |
| `border` / `border-subtle` | neutral-200 / 150 | neutral-800 / 850 | panel outlines / hairlines |
| `border-strong` | neutral-400 | neutral-500 | form controls (≥ 3:1) |
| `accent` | accent-600 | accent-400 | primary buttons, checked controls |
| `text-on-accent` | white | neutral-1000 | labels on accent/status fills |
| `success/warning/danger/info` | 700 text, 50 bg, 200 border, 600 fill | 300 / 950 / 800 / 400 | messages, badges |

Full list with values: [docs/tokens.md](docs/tokens.md).

### Rules

1. **One accent.** Accent colour marks what is interactive or selected. Status colours are for status only.
2. **Hierarchy by weight and size**, not colour. Headings are `text-strong`, not accent.
3. Never put text on `accent-500` or lighter in light mode; never on `accent-500` or darker in dark mode.
4. Colour is never the only signal (errors also have an icon and text; the energy label also has a letter).
5. Every ramp shares the same OKLCH lightness per step, so **any accent ramp can replace any other**
   with identical contrast. New themes are generated, not hand-picked (see `site/themes.html`).

### Themes

`fjord` (default, blue) · `furu` (pine) · `lyng` (heather) · `nordlys` (teal) ·
`bjork` (ink on warm paper) · `tyttebaer` (lingonberry) · `retro` (2011) ·
`kontrast` (high contrast). Every theme has light and dark mode.

---

## 4. Typography

- **Family**: Inter Variable (self-hosted, OFL), system stack fallback. One family only.
- **Body**: 16px / 1.5. Never smaller than 13px for any text (`--os-text-xs`).
- **Weights**: 400 body, 500 labels/links in UI, 600 headings/values, 700 prices/brand.
- **Tracking**: −0.015em on headings, −0.035em on the wordmark, +0.06em on uppercase eyebrows.
- **Numbers**: `font-variant-numeric: tabular-nums` for prices, facts, tables.

| Token | Size | Use |
|---|---|---|
| `--os-text-5xl` | 40→64px fluid | landing display only |
| `--os-text-3xl` | 26→32px | page title (H1) |
| `--os-text-2xl` | 22→24px | section heads, prices in summaries |
| `--os-text-lg` | 18px | panel titles, lead text, result titles |
| `--os-text-md` | 16px | body, buttons, inputs |
| `--os-text-sm` | 14px | secondary text, actions, crumbs, meta links |
| `--os-text-xs` | 13px | meta lines, captions |
| `--os-text-2xs` | 12px | badges only |

Norwegian conventions: `7 500 kr` with a no-break space thousands separator
(`Intl.NumberFormat('nb-NO')`), dates as `26. september 2026`, times `20:18`,
ranges with en dash `13:00–14:00`, area `29 m²`.

---

## 5. Space, shape, elevation

- **4px grid**: `--os-space-1` = 4px … `--os-space-24` = 96px (Tailwind-compatible names).
- **Role spacing**: `--os-pad` panel padding (16→24px), `--os-gap` between panels (12→20px),
  `--os-row-pad` key/value rows (10px), `--os-gutter` page sides (16→24px).
- **Radius**: panels 8px, controls/media 6px, badges 4px, pills full. `retro`: 0.
- **Borders**: 1px everywhere (`kontrast`: 2px). Hairlines inside panels use `border-subtle`.
- **Elevation**: panels are flat (`--os-shadow-panel: none`). Shadows only for things that float:
  menus/sticky bars (`--os-shadow-raised`) and dialogs/sheets (`--os-shadow-overlay`).
- **Density**: `data-density="compact"` tightens padding, rows and control heights (44 → 36px).

---

## 6. Components (summary)

| Component | Class | Key rules |
|---|---|---|
| Panel | `.os-panel` + `__header/__title/__body/__footer` | White, 1px border, 8px radius, tinted header band; body padding `--os-pad`. |
| Masthead | `.os-masthead`, `.os-brand`, `.os-utilnav` | On the canvas. Utility links divided by 1px hairlines. |
| Crumb bar | `.os-crumbbar`, `.os-breadcrumbs`, `.os-pager` | Panel-like strip. "/" separators. Pager: ‹ Forrige · Resultat n av N · Neste ›. |
| Actions | `.os-actions`, `.os-action` | Icon + underlined word, hairline dividers; toggles use `aria-pressed`. |
| Heading | `.os-heading` | Eyebrow (caps, accent), H1 3xl, subtitle muted with pin icon. |
| Meta / refcode | `.os-meta`, `.os-refcode` | 13px muted, dot separated; listing code large and copyable. |
| Key facts | `.os-keyfacts` | 3–5 facts with icons under the title. |
| Gallery | `.os-gallery` | Picture + 2×2 thumbs (≥ 34rem), carousel + counter below. |
| Link row | `.os-linkrow` | 18px medium links with accent icons; list rows when narrow. |
| Key/value | `.os-kv` | `dt` muted, `dd` strong tabular; `--cols` auto columns; `--end` right-aligned. |
| Price | `.os-price` | Label small muted; amount bold 24–32px, tabular, no wrap. |
| Contact | `.os-contact` | Brand band (agency colours), avatar, primary "Ring", secondary e-mail, links. |
| Result | `.os-result` | Thumb 4:3, eyebrow, link-coloured title (visited!), facts, price, meta, save heart. |
| Button | `.os-button` | 44px; default = secondary (surface + strong border); one `--primary` per view. |
| Field | `.os-field`, `.os-input`, `.os-select` | Label above, hint, error below with icon; `aria-invalid`. |
| Filters | `.os-filters` | Sidebar panel ≥ 60em; popover sheet below. Groups are `<details>`. |
| Mobile bar | `.os-mobilebar` | Fixed bottom, price + 1–2 buttons, hidden ≥ 60em. |

Complete markup for all 45+ components: `site/components.html` and [docs/components.md](docs/components.md).

---

## 7. Iconography & imagery

- Lucide icons, 24px grid, **1.75 stroke**, round caps and joins, `currentColor`.
- Icons are 1.25em of the surrounding text; muted or accent coloured, never multicolour.
- Photography is content: 4:3 for listings, 3:2 for neighbourhood, 16:9 only for landing cards.
  Images get `border-radius: var(--os-radius-media)`. No overlays on content images except
  the gallery counter and badges.

---

## 8. Motion

- Durations 80 / 140 / 220 / 360ms; easing `cubic-bezier(0.2, 0, 0, 1)`.
- Only: hover colour changes, disclosure chevrons, sheet slide-in, dialog fade-in, toast.
- `prefers-reduced-motion: reduce` sets every duration to 0.

---

## 9. Accessibility (non-negotiable)

- Text contrast ≥ 4.5:1, UI boundaries and focus ≥ 3:1 — verified for every theme × mode by `npm run check`.
- Visible focus ring: 2px `--os-color-focus`, 2px offset (3px in `kontrast`).
- Touch targets ≥ 44px for controls, ≥ 24px for inline links in lists.
- Skip link first; landmarks (`header`, `nav` with labels, `main`, `aside`, `footer`).
- Every icon-only control has an accessible name. Decorative icons are `aria-hidden`.
- Forms: visible labels, hints and errors linked with `aria-describedby`.
- Respect user font size (rem everywhere), 400% zoom reflow, forced-colors, print.

---

## 10. Do / don't

| Do | Don't |
|---|---|
| Put every piece of content in a panel | Float text directly on the canvas (except section heads) |
| Underline links in content | Rely on colour alone to show a link |
| Use `.os-kv` for facts | Build fact tables from bold spans and `<br>` |
| Repeat price/contact in aside + mobile bar | Hide contact info below the fold on phones |
| Use tokens (`var(--os-…)`) | Hard-code hex values, px font sizes or shadows |
| Add a theme by choosing ramps | Fork component CSS per brand |
| One primary button per view | Several competing accent fills |
