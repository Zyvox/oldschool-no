/**
 * Foundation — the non-color scales.
 *
 * The proportions are the 2000s ones on purpose: a ~1000px page, a 300px
 * sidebar, 14px Arial body text, 10px gaps between boxes, 12px padding inside
 * them. What changed from the originals is consistency (one 4px grid, one
 * type scale) and legibility (14px instead of 11–12px, 1.45 leading).
 *
 * Two tiers:
 *  1. Primitive scales (`--os-space-4`, `--os-text-lg`, `--os-radius-sm` …),
 *     declared once on :root.
 *  2. Role tokens (`--os-pad`, `--os-radius-panel`, `--os-control-height` …),
 *     re-declared on every [data-theme] / [data-density] scope so themes and
 *     density modes can re-point them on any subtree.
 */

export const fonts = {
  sans: 'Arial, "Helvetica Neue", Helvetica, "Liberation Sans", "Nimbus Sans", sans-serif',
  verdana: 'Verdana, "DejaVu Sans", Geneva, Tahoma, sans-serif',
  serif: 'Georgia, "Times New Roman", "Liberation Serif", serif',
  mono: '"Courier New", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
};

/** Type scale — fixed, like the originals, one step apart in px. */
export const text = {
  '2xs': '0.6875rem', // 11
  xs: '0.75rem', //       12
  sm: '0.8125rem', //     13
  md: '0.875rem', //      14  body
  lg: '1rem', //          16  box titles
  xl: '1.125rem', //      18
  '2xl': '1.25rem', //    20
  '3xl': '1.5rem', //     24  page title
  '4xl': '1.875rem', //   30  key figures
  '5xl': '2.25rem', //    36
};

export const leading = { none: '1', tight: '1.2', snug: '1.3', normal: '1.45', relaxed: '1.6' };

export const tracking = { tight: '-0.01em', normal: '0', wide: '0.02em', caps: '0.05em' };

export const weight = { regular: '400', bold: '700' };

/** 4px-based spacing scale (names match Tailwind's). */
export const space = {
  0: '0', px: '1px', '0-5': '0.125rem', 1: '0.25rem', '1-5': '0.375rem', 2: '0.5rem',
  '2-5': '0.625rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem',
  10: '2.5rem', 12: '3rem', 16: '4rem',
};

export const radius = { none: '0', xs: '2px', sm: '3px', md: '4px', lg: '6px', full: '9999px' };

export const border = { thin: '1px', thick: '2px' };

export const duration = { instant: '60ms', fast: '120ms', base: '180ms' };

export const ease = { standard: 'ease-out' };

export const z = { base: '0', raised: '10', sticky: '100', header: '200', dropdown: '300', overlay: '400', dialog: '500', toast: '600' };

/** Page widths: lg is the classic 1000px page; xl (.os-container--wide) suits 16:9 screens and still floats centred. */
export const container = { sm: '40rem', md: '48rem', lg: '62.5rem', xl: '75rem' };

export const icon = { sm: '0.875rem', md: '1rem', lg: '1.25rem', stroke: '2' };

/**
 * Breakpoints (documentation + JSON; the CSS writes the same em values):
 *   sm  40em (640px)   phones → small tablets
 *   md  60em (960px)   two columns switch on
 */
export const breakpoints = { sm: '40em', md: '60em' };

/* ---------------------------------------------------------------------------
 * Role tokens. Values may reference primitives with {group.key}.
 * [name, value, description]
 * ------------------------------------------------------------------------ */
export const roles = [
  // Typography
  ['font-body', '{font.sans}', 'Body copy font stack.'],
  ['font-heading', '{font.sans}', 'Headings font stack.'],
  ['text-body', '{text.md}', 'Body copy size (14px).'],
  ['leading-body', '{leading.normal}', 'Body copy line-height.'],
  ['weight-heading', '{weight.bold}', 'Weight for headings and box titles.'],
  ['weight-strong', '{weight.bold}', 'Weight for values, prices, <strong>.'],
  ['tracking-heading', '{tracking.tight}', 'Letter-spacing for headings.'],

  // Layout rhythm
  ['gutter', '0.75rem', 'Side padding of the page frame.'],
  ['gap', '0.625rem', 'Gap between boxes on the canvas (10px).'],
  ['pad', '0.75rem', 'Inner padding of boxes (12px).'],
  ['row-pad', '0.3125rem', 'Vertical padding of key/value, table and list rows.'],
  ['measure', '72ch', 'Max line length for running text.'],
  ['container-width', '{container.lg}', 'Max width of the page (1000px). .os-container--wide and data-width="wide": 1200px.'],
  ['aside-width', '18.75rem', 'Width of the right column (300px — the classic sidebar).'],
  ['sidebar-width', '12.5rem', 'Width of a left navigation column (200px).'],

  // Shape
  ['radius-panel', '{radius.sm}', 'Corner radius of boxes (3px).'],
  ['radius-control', '{radius.sm}', 'Corner radius of buttons and inputs.'],
  ['radius-tab', '{radius.md}', 'Top corners of folder tabs.'],
  ['radius-badge', '{radius.xs}', 'Corner radius of badges.'],
  ['border-width', '{border.thin}', 'Border and rule width.'],

  // Controls
  ['control-height', '1.875rem', 'Height of buttons and inputs (30px; 40px on touch screens).'],
  ['control-height-sm', '1.5rem', 'Height of small buttons and inputs.'],
  ['control-height-lg', '2.25rem', 'Height of large buttons and inputs.'],
  ['control-pad-x', '0.625rem', 'Horizontal padding of buttons and inputs.'],

  // Elevation
  ['shadow-panel', 'none', 'Boxes are flat.'],
  ['shadow-raised', '0 2px 6px {color.shadow}', 'Menus and popovers.'],
  ['shadow-overlay', '0 4px 24px {color.shadow-strong}', 'Dialogs.'],
  ['bevel', 'inset 0 1px 0 rgb(255 255 255 / 0.55)', 'Top highlight on buttons and bands — the one nod to 2008 gloss.'],

  // Focus & links
  ['focus-width', '2px', 'Focus ring thickness.'],
  ['focus-offset', '1px', 'Gap between element and focus ring.'],
  ['link-underline-offset', '0.15em', 'Distance from baseline to link underline.'],
  ['link-underline-thickness', '1px', 'Link underline thickness.'],
];

/** Density modes re-point role tokens. `standard` is the default. */
export const densities = {
  compact: {
    description: 'One text step smaller and tight boxes — the 11px Verdana of 2008 in the retro theme.',
    values: {
      'text-body': '{text.sm}',
      'leading-body': '1.4',
      gap: '0.5rem',
      pad: '0.625rem',
      'row-pad': '0.1875rem',
      'control-height': '1.5rem',
      'control-height-sm': '1.5rem',
    },
  },
  comfortable: {
    description: 'More air for long-form reading and touch screens: 15px text, 44px controls.',
    values: {
      'text-body': '0.9375rem',
      'leading-body': '1.55',
      gap: '0.875rem',
      pad: '1rem',
      'row-pad': '0.5rem',
      'control-height': '2.75rem',
      'control-height-sm': '2.25rem',
      'control-height-lg': '3rem',
    },
  },
};
