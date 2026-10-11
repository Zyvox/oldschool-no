# Layout and responsive patterns

## Page shell

Everything sits in one centred column on the frame, the way portals were laid
out in 2008:

```html
<body class="os-page">
  <a class="os-skiplink" href="#main">Hopp til hovedinnhold</a>
  <div class="os-container os-container--bleed">
    <header class="os-masthead">…</header>
    <nav class="os-tabbar" aria-label="Hovedmeny">…</nav>      <!-- optional -->
    <div class="os-crumbbar">…breadcrumbs… …pager…</div>
    <main class="os-layout" id="main">
      <div class="os-layout__main">…boxes…</div>
      <aside class="os-layout__aside">…boxes…</aside>
    </main>
    <footer class="os-footer">…</footer>
  </div>
  <div class="os-mobilebar" role="region" aria-label="…">…</div>   <!-- optional, direct child of body -->
</body>
```

## Widths

| Class / attribute | Width | For |
| --- | --- | --- |
| `.os-container` | 1000px + gutters | everything — the classic page |
| `.os-container--wide` or `<html data-width="wide">` | 1200px | app pages, dashboards, wide tables |
| `.os-container--md` | 768px | forms, articles without a sidebar |

All are centred on the frame, so even the wide page floats with the frame
visible on both sides of a 1920px screen. The value is one role token —
`--os-container-width` — so any other width is one line of CSS.

## Columns

```html
<main class="os-layout">              main + 300px aside        detail pages
<main class="os-layout os-layout--start">  200px menu + main    search, settings, self-service
<main class="os-layout os-layout--three">  menu + main + aside  front pages
<main class="os-layout os-layout--late">   main + aside from 76em  pages with wide tables
<main class="os-layout os-layout--single"> one column
```

For `--start` and `--three`, put the left column first in source as
`.os-layout__nav`. Below 60em every column stacks in source order: nav, main,
aside. Repeat what matters (the price, the contact) in the main column or the
mobile bar instead of re-ordering with CSS.

**Tables and the aside.** A 300px aside leaves ~690px for the main column on
the classic page — tight for a six-column table with buttons. Choose one:

1. `.os-container--wide` — main gets ~890px;
2. `.os-layout--late` — the aside drops below the content until the screen is
   76em (1216px) wide, so laptops give the table the full width;
3. `.os-table--stack` on the table — under 36em of container width its rows
   become small label/value boxes, so phones never scroll sideways.

The `jobs.html` demo page uses all three.

Layout primitives for inside boxes: `.os-stack` (vertical rhythm),
`.os-cluster` (wrapping row), `.os-split` (two ends of a row), `.os-columns`
(2 or 3 equal columns from 40em) and `.os-grid` (auto-fit cards). See
`src/css/layout/primitives.css`.

## Breakpoints

| Name | Min width | What happens |
| --- | --- | --- |
| — | 0 | one column; boxes edge to edge with `--bleed`; masthead links in a popover; breadcrumbs as "‹ parent"; mobile bar |
| `sm` | 40em / 640px | gutters and full breadcrumbs return; masthead links inline |
| `md` | 60em / 960px | columns side by side; filters as a sidebar; mobile bar hidden |
| `lg` | 76em / 1216px | `--late` layouts get their aside |

Media queries use `em` so they respect the user's font size. Custom properties
cannot be used in `@media`, so the values are written out and exported in
`dist/tokens.json` (`breakpoints`).

**Prefer container queries.** Boxes (`.os-panel`), table wraps and threads are
size containers, so their contents respond to the space they actually get:
facts in a wide main column flow into two columns, the same facts in the aside
stay in one; a form puts labels beside fields only when its box is ≥ 34rem.

## Phone patterns

| Pattern | Where | How |
| --- | --- | --- |
| Edge-to-edge boxes | `.os-container--bleed` < 40em | no side gutter, borders or radius |
| Masthead menu | `.os-masthead__toggle` + `popover` | the utility links in a dropdown, no JS |
| Short breadcrumbs | `.os-breadcrumbs` < 40em | only "‹ parent"; `--full` keeps the trail |
| Mobile bar | `.os-mobilebar` < 60em | key figure + primary action, fixed to the bottom |
| Filter sheet | `.os-filters` < 60em | the sidebar box becomes a `popover` sheet |
| Stacked table | `.os-table--stack` in < 36em | rows become label/value boxes |
| Stacked thread | `.os-thread` < 32rem | author line above each post |

Everything above works without JavaScript; `popover` is supported by every
current browser, and older ones simply show the content inline.
