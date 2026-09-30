/**
 * Foundation — the non-color scales.
 *
 * Two tiers:
 *  1. Primitive scales (`--os-space-4`, `--os-text-lg`, `--os-radius-md` …),
 *     declared once on :root.
 *  2. Role tokens (`--os-pad`, `--os-radius-panel`, `--os-control-height` …),
 *     re-declared on every [data-theme] / [data-density] scope so that themes
 *     (e.g. `retro`) and density modes can re-point them on any subtree.
 *
 * Components only ever use role tokens + primitive scales, never literals.
 */

export const fonts = {
  sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  mono: 'ui-monospace, "SF Mono", SFMono-Regular, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Consolas, monospace',
};

/** Type scale. Headline sizes are fluid between a 360px and 1280px viewport. */
export const text = {
  '2xs': '0.75rem',
  xs: '0.8125rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': 'clamp(1.375rem, 1.32rem + 0.25vw, 1.5rem)',
  '3xl': 'clamp(1.625rem, 1.47rem + 0.7vw, 2rem)',
  '4xl': 'clamp(2rem, 1.69rem + 1.4vw, 2.75rem)',
  '5xl': 'clamp(2.5rem, 1.88rem + 2.8vw, 4rem)',
};

export const leading = { none: '1', tight: '1.15', snug: '1.3', normal: '1.5', relaxed: '1.65' };

export const tracking = { tighter: '-0.025em', tight: '-0.015em', normal: '0', wide: '0.01em', caps: '0.06em' };

export const weight = { regular: '400', medium: '500', semibold: '600', bold: '700' };

/** 4px-based spacing scale (names match Tailwind's for easy mapping). */
export const space = {
  0: '0', px: '1px', '0-5': '0.125rem', 1: '0.25rem', '1-5': '0.375rem', 2: '0.5rem',
  '2-5': '0.625rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem',
  8: '2rem', 10: '2.5rem', 12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem',
};

export const radius = { none: '0', xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px', full: '9999px' };

export const border = { thin: '1px', thick: '2px' };

export const duration = { instant: '80ms', fast: '140ms', base: '220ms', slow: '360ms' };

export const ease = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
};

export const z = { base: '0', raised: '10', sticky: '100', header: '200', dropdown: '300', overlay: '400', dialog: '500', toast: '600' };

export const container = { sm: '40rem', md: '60rem', lg: '76rem', xl: '90rem' };

export const icon = { xs: '0.875rem', sm: '1rem', md: '1.25rem', lg: '1.5rem', xl: '2rem', stroke: '1.75' };

/**
 * Breakpoints. CSS custom properties cannot be used inside @media, so these are
 * documentation + JSON only; the CSS hard-codes the same em values.
 *   sm  40em  (640px)   phablet → small tablet
 *   md  60em  (960px)   two-column layouts switch on
 *   lg  76em  (1216px)  full container width reached
 */
export const breakpoints = { sm: '40em', md: '60em', lg: '76em' };

/* ---------------------------------------------------------------------------
 * Role tokens. Values may reference primitives with {group.key}.
 * [name, value, description]
 * ------------------------------------------------------------------------ */
export const roles = [
  // Typography
  ['font-body', '{font.sans}', 'Body copy font stack.'],
  ['font-heading', '{font.sans}', 'Headings font stack.'],
  ['text-body', '{text.md}', 'Body copy size.'],
  ['leading-body', '{leading.normal}', 'Body copy line-height.'],
  ['weight-heading', '{weight.semibold}', 'Weight for headings and panel titles.'],
  ['weight-strong', '{weight.semibold}', 'Weight for values in key/value lists, prices, <strong>.'],
  ['tracking-heading', '{tracking.tight}', 'Letter-spacing for headings.'],

  // Layout rhythm
  ['gutter', 'clamp(1rem, 0.52rem + 2.1vw, 1.5rem)', 'Container side padding.'],
  ['gap', 'clamp(0.75rem, 0.52rem + 1vw, 1.25rem)', 'Gap between panels on the canvas.'],
  ['pad', 'clamp(1rem, 0.52rem + 2.1vw, 1.5rem)', 'Inner padding of panels.'],
  ['row-pad', '0.625rem', 'Vertical padding of key/value and list rows.'],
  ['measure', '68ch', 'Max line length for running text.'],
  ['container-width', '{container.lg}', 'Max width of the page container.'],
  ['aside-width', '22.5rem', 'Width of the right-hand aside (summary, contact).'],
  ['sidebar-width', '17rem', 'Width of a left sidebar (filters, docs nav).'],

  // Shape
  ['radius-panel', '{radius.lg}', 'Corner radius of panels and cards.'],
  ['radius-control', '{radius.md}', 'Corner radius of buttons and inputs.'],
  ['radius-media', '{radius.md}', 'Corner radius of images inside panels.'],
  ['radius-badge', '{radius.sm}', 'Corner radius of badges and tags.'],
  ['border-width', '{border.thin}', 'Default border and hairline width.'],

  // Controls
  ['control-height', '2.75rem', 'Height of buttons and inputs (44px touch target).'],
  ['control-height-sm', '2.25rem', 'Height of small buttons and inputs.'],
  ['control-height-lg', '3.25rem', 'Height of large buttons and inputs.'],
  ['control-pad-x', '1rem', 'Horizontal padding of buttons and inputs.'],

  // Elevation
  ['shadow-panel', 'none', 'Panels are flat: separation comes from the canvas.'],
  ['shadow-raised', '0 1px 2px {color.shadow}, 0 4px 12px -2px {color.shadow}', 'Menus, popovers, sticky bars.'],
  ['shadow-overlay', '0 2px 6px {color.shadow}, 0 24px 48px -12px {color.shadow-strong}', 'Dialogs and sheets.'],

  // Focus & links
  ['focus-width', '2px', 'Focus ring thickness.'],
  ['focus-offset', '2px', 'Gap between element and focus ring.'],
  ['link-underline-mix', '45%', 'Opacity of link underlines (mixed with the link color).'],
  ['link-underline-thickness', '1px', 'Link underline thickness (doubles on hover).'],
  ['link-underline-offset', '0.2em', 'Distance from baseline to underline.'],
];

/** Density modes re-point role tokens. `comfortable` is the default. */
export const densities = {
  compact: {
    description: 'Information-dense mode for data-heavy screens (≈2005 density, modern legibility).',
    values: {
      'text-body': '0.9375rem',
      'leading-body': '1.45',
      gap: '0.625rem',
      pad: '0.875rem',
      'row-pad': '0.375rem',
      'control-height': '2.25rem',
      'control-height-sm': '1.875rem',
      'control-height-lg': '2.75rem',
      'control-pad-x': '0.75rem',
    },
  },
};
