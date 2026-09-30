# Layout and responsive patterns

## Page shell

```html
<body class="os-page">
  <a class="os-skiplink" href="#main">Hopp til hovedinnhold</a>
  <header class="os-masthead">…</header>
  <div class="os-page__body">
    <div class="os-container os-container--bleed">
      <div class="os-crumbbar">…</div>
      <main class="os-layout" id="main">
        <article class="os-layout__main">…panels…</article>
        <aside class="os-layout__aside">…panels…</aside>
      </main>
    </div>
  </div>
  <footer class="os-footer">…</footer>
  <div class="os-mobilebar">…</div>   <!-- optional, direct child of body -->
</body>
```

`.os-page` is a flex column so the footer sits at the bottom of short pages.

## Breakpoints

| Name | Min width | What happens |
|---|---|---|
| — | 0 | one column, panels as edge-to-edge sheets (with `--bleed`), mobile bar |
| `sm` | 40em / 640px | gutters and panel radius return; pager shows words |
| `md` | 60em / 960px | two columns, masthead links inline, filters as sidebar, mobile bar hidden |
| `lg` | 76em / 1216px | container reaches max width |

Media queries use `em` so they respect the user's font size. CSS variables
cannot be used in `@media`, so these values are written out in the CSS and
exported in `dist/tokens.json` (`breakpoints`).

**Prefer container queries.** Panels (`.os-panel`), the gallery and result
lists are size containers, so their contents respond to the space they get: a
key/value list in a wide main column gets two columns, the same list in the
aside stays one. Write new components the same way.

## Layouts

| Class | Columns ≥ 60em | Use |
|---|---|---|
| `.os-layout` | `1fr 22.5rem` | detail pages: content + summary/contact aside |
| `.os-layout--start` | `17rem 1fr` | search/docs: filters or navigation on the left (put the aside first in source) |
| `.os-layout--single` | `1fr` | landing pages, forms |
| `.os-layout__sticky` | — | makes an aside item sticky (only if it is shorter than the viewport) |

## Primitives

| Class | What |
|---|---|
| `.os-container` (`--sm/--md/--xl`, `--bleed`) | max-width + gutters |
| `.os-stack` (`--2xs` … `--2xl`, `--gap`) | vertical rhythm between children |
| `.os-cluster` (`--sm/--lg/--baseline/--end/--nowrap`) | wrapping inline group |
| `.os-split` | two ends pushed apart |
| `.os-grid` (`--sm/--lg/--fit`, `--2/--3/--4`) | auto-fill grid, min width via `--os-grid-min` |
| `.os-frame` (`--16x9/--3x2/--1x1`) | aspect-ratio media box |
| `.os-scroller` | horizontal scroll-snap strip |
| `.os-divider` | hairline |
| `.os-bleed` | pull a child out to the panel edges |

## Mobile patterns

These are the "separate where necessary" parts — each is a deliberate mobile
design, not just a squeezed desktop:

| Pattern | Class / mechanism | Why |
|---|---|---|
| Edge-to-edge sheets | `.os-container--bleed` | ~10% more reading width; the canvas still separates groups |
| Sticky contact bar | `.os-mobilebar` | the aside is far down on phones — price and "Ring" stay in reach |
| Collapsed breadcrumbs | `.os-breadcrumbs` | only "‹ parent" — the full trail rarely fits |
| Icon actions | `.os-actions` in narrow containers | 44px targets; words remain for screen readers |
| Carousel gallery | `.os-gallery` < 34rem | swipe with counter instead of thumbnails |
| List-style link row | `.os-linkrow` < 30rem | full-width rows with chevrons are easier to tap |
| Filter sheet | `.os-filters[popover]` | a full-height sheet opened by "Filtrer (3)", no JS |
| Menu popover | `.os-masthead__nav[popover]` | utility links in a dropdown, no JS |
| Pager / pagination | icon buttons + "Side 2 av 15" | fits one row |

Test with the device preview (`site/preview.html`) and `npm run smoke`, which
fails on horizontal overflow at 360px.
