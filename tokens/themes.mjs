/**
 * Themes — color schemes (and two "structural" themes).
 *
 * A theme is mostly a choice of two ramps from tokens/palette.mjs:
 *   accent   → --os-accent-50 … 950   (links, buttons, tints, focus)
 *   neutral  → --os-neutral-0 … 1000  (text, surfaces, borders)
 * plus optional overrides:
 *   visited    ramp for visited links (default: lyng)
 *   status     { success, warning, danger, info } ramp names
 *   primitives foundation primitives, e.g. { 'text-md': '0.8125rem' }
 *   roles      role tokens, e.g. { 'radius-panel': '0' }
 *   colors     semantic colors, e.g. { canvas: { light: 'accent.200', dark: 'neutral.1000' } }
 *
 * Light/dark is NOT part of a theme: every theme works in both modes via
 * `data-mode` / `color-scheme`.
 *
 * Apply with <html data-theme="furu">, or on any element to theme a subtree.
 */

export const defaultTheme = 'fjord';

export const defaultVisited = 'lyng';

export const statusRamps = { success: 'mose', warning: 'multe', danger: 'tyttebaer', info: 'fjord' };

export const themes = {
  fjord: {
    label: 'Fjord',
    accent: 'fjord',
    neutral: 'is',
    description: 'The default. Fjord blue on ice grey — the closest modern echo of the 2000s original.',
  },
  furu: {
    label: 'Furu',
    accent: 'furu',
    neutral: 'granitt',
    description: 'Pine green on granite. Calm and outdoorsy.',
  },
  lyng: {
    label: 'Lyng',
    accent: 'lyng',
    neutral: 'is',
    visited: 'blekk',
    description: 'Heather violet. Soft, a little playful.',
  },
  nordlys: {
    label: 'Nordlys',
    accent: 'nordlys',
    neutral: 'is',
    description: 'Aurora teal on ice. Crisp and technical.',
  },
  bjork: {
    label: 'Bjørk',
    accent: 'blekk',
    neutral: 'sand',
    description: 'Ink on birch paper. Warm, editorial, almost colorless.',
  },
  tyttebaer: {
    label: 'Tyttebær',
    accent: 'tyttebaer',
    neutral: 'sand',
    visited: 'blekk',
    description: 'Lingonberry red on warm sand. For brands that want a bold primary.',
  },
  retro: {
    label: 'Retro 2011',
    accent: 'retroBlue',
    neutral: 'retroGray',
    visited: 'lyng',
    structural: true,
    description: 'The original, reconstructed: Arial, square corners, 13px text, pale-blue frame. Same markup.',
    primitives: {
      'text-2xs': '0.6875rem',
      'text-xs': '0.6875rem',
      'text-sm': '0.75rem',
      'text-md': '0.8125rem',
      'text-lg': '0.9375rem',
      'text-xl': '1.0625rem',
      'text-2xl': '1.25rem',
      'text-3xl': '1.375rem',
      'text-4xl': '1.75rem',
      'text-5xl': '2.25rem',
    },
    roles: {
      'font-body': 'Arial, Helvetica, sans-serif',
      'font-heading': 'Arial, Helvetica, sans-serif',
      'leading-body': '1.4',
      'weight-heading': '{weight.bold}',
      'weight-strong': '{weight.bold}',
      'tracking-heading': '0',
      gutter: '0.5rem',
      gap: '0.5rem',
      pad: '0.75rem',
      'row-pad': '0.3125rem',
      'container-width': '62rem',
      'aside-width': '17rem',
      'radius-panel': '0',
      'radius-control': '3px',
      'radius-media': '0',
      'radius-badge': '0',
      'control-height': '1.875rem',
      'control-height-sm': '1.5rem',
      'control-height-lg': '2.25rem',
      'control-pad-x': '0.625rem',
      'shadow-raised': '1px 1px 4px {color.shadow-strong}',
      'link-underline-mix': '100%',
      'link-underline-offset': 'auto',
    },
    colors: {
      canvas: { light: 'accent.200', dark: 'neutral.1000' },
      'panel-border': { light: 'transparent', dark: 'transparent' },
      'panel-header': { light: 'accent.100', dark: 'accent.950' },
      'panel-header-border': { light: 'transparent', dark: 'transparent' },
      'surface-tint': { light: 'accent.100', dark: 'accent.950' },
      crumbbar: { light: 'accent.50', dark: 'accent.950' },
      text: { light: 'neutral.900', dark: 'neutral.50' },
      'text-muted': { light: 'neutral.700', dark: 'neutral.400' },
    },
  },
  kontrast: {
    label: 'Kontrast',
    accent: 'fjord',
    neutral: 'granitt',
    visited: 'lyng',
    structural: true,
    description: 'Maximum contrast for low vision: black on white, 2px borders, thick focus rings.',
    roles: {
      'weight-strong': '{weight.bold}',
      'border-width': '2px',
      'focus-width': '3px',
      'link-underline-mix': '100%',
      'link-underline-thickness': '2px',
    },
    colors: {
      canvas: { light: 'neutral.0', dark: 'neutral.1000' },
      surface: { light: 'neutral.0', dark: 'neutral.1000' },
      'surface-raised': { light: 'neutral.0', dark: 'neutral.1000' },
      'surface-sunken': { light: 'neutral.50', dark: 'neutral.950' },
      'surface-muted': { light: 'neutral.50', dark: 'neutral.950' },
      'surface-tint': { light: 'neutral.100', dark: 'neutral.900' },
      text: { light: 'neutral.1000', dark: 'neutral.0' },
      'text-muted': { light: 'neutral.800', dark: 'neutral.200' },
      'text-subtle': { light: 'neutral.700', dark: 'neutral.300' },
      link: { light: 'accent.800', dark: 'accent.200' },
      'link-hover': { light: 'accent.900', dark: 'accent.100' },
      'text-accent': { light: 'accent.800', dark: 'accent.200' },
      accent: { light: 'accent.700', dark: 'accent.300' },
      'accent-hover': { light: 'accent.800', dark: 'accent.200' },
      border: { light: 'neutral.700', dark: 'neutral.300' },
      'border-subtle': { light: 'neutral.400', dark: 'neutral.600' },
      'border-strong': { light: 'neutral.1000', dark: 'neutral.0' },
      'panel-header-border': { light: '=border', dark: '=border' },
      focus: { light: 'neutral.1000', dark: 'warning.300' },
    },
  },
};
