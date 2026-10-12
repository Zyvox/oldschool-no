/**
 * Themes — the look, independent of colour.
 *
 * Colour comes from tokens/palette.mjs (one accent seed); a theme only
 * decides *how* the ramps are used and how big, tight and square things are.
 * There are two:
 *
 *   retro     the default. The 2008 portal as it was — Verdana, a saturated
 *             frame, square corners, tight boxes — with a calmer palette,
 *             24px targets and WCAG AA contrast.
 *   standard  the same structure, tidied: Arial 14px, a paler frame, 3px
 *             corners, ruled rows and a little more air.
 *
 * Light/dark mode and density work with both. A theme is a list of overrides
 * on top of the base tokens (tokens/foundation.mjs, tokens/semantic.mjs):
 *   primitives  foundation primitives, e.g. { 'text-md': '0.75rem' }
 *   roles       role tokens, e.g. { 'radius-panel': '0' }
 *   colors      semantic colours, e.g. { canvas: { light: 'frame.200', dark: 'neutral.1000' } }
 *
 * Apply with <html data-theme="standard">, or on any element to theme a
 * subtree. The default theme also applies when no data-theme is set.
 * How to add one: docs/theming.md.
 */

export const defaultTheme = 'retro';

export const themes = {
  retro: {
    label: 'Retro',
    description: 'The default. The 2008 portal as it was: Verdana 12px, saturated frame, square corners, tight boxes.',
    primitives: {
      'text-2xs': '0.625rem',
      'text-xs': '0.6875rem',
      'text-sm': '0.6875rem',
      'text-md': '0.75rem',
      'text-lg': '0.875rem',
      'text-xl': '1rem',
      'text-2xl': '1.125rem',
      'text-3xl': '1.25rem',
      'text-4xl': '1.5rem',
      'text-5xl': '1.75rem',
    },
    roles: {
      'font-body': '{font.verdana}',
      'leading-body': '1.35',
      'tracking-heading': '0',
      gap: '0.5rem',
      pad: '0.625rem',
      'row-pad': '0.25rem',
      'radius-panel': '0',
      'radius-control': '0',
      'radius-tab': '0',
      'radius-badge': '0',
      'control-height': '1.5rem',
      'control-height-sm': '1.5rem',
      'control-height-lg': '1.875rem',
      'control-pad-x': '0.5rem',
      bevel: 'none',
      'link-underline-offset': 'auto',
    },
    colors: {
      canvas: { light: 'frame.200', dark: 'neutral.1000' },
      crumbbar: { light: 'frame.50', dark: 'frame.950' },
      'panel-border': { light: 'transparent', dark: 'transparent' },
      'panel-header': { light: 'frame.100', dark: 'frame.950' },
      'panel-header-border': { light: 'transparent', dark: 'transparent' },
      text: { light: 'neutral.900', dark: 'neutral.50' },
      'text-muted': { light: 'neutral.700', dark: 'neutral.400' },
    },
  },
  standard: {
    label: 'Standard',
    description: 'The same structure, tidied: Arial 14px, a paler frame, 3px corners, ruled rows and more air.',
  },
};

/**
 * prefers-contrast: more — applied on top of either theme when the visitor
 * asks the OS for more contrast. Values only ever get stronger.
 */
export const moreContrast = {
  roles: {
    'link-underline-thickness': '2px',
    'focus-width': '3px',
  },
  colors: {
    'text-muted': { light: 'neutral.800', dark: 'neutral.200' },
    'text-subtle': { light: 'neutral.700', dark: 'neutral.300' },
    border: { light: 'neutral.500', dark: 'neutral.400' },
    'border-strong': { light: 'neutral.800', dark: 'neutral.200' },
    'panel-border': { light: 'neutral.800', dark: 'neutral.300' },
    link: { light: 'link.800', dark: 'link.200' },
  },
};
