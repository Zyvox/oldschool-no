/**
 * Themes — the look, independent of colour.
 *
 * Colour comes from tokens/palette.mjs (one accent seed); a theme only
 * decides *how* the ramps are used and how big, tight and square things are.
 * There are two:
 *
 *   standard  the default. The 2008 portal layout with today's controls:
 *             Arial 13px, the saturated frame, square boxes, 30px controls
 *             with 3px corners, flat buttons. The base tokens
 *             (tokens/foundation.mjs, tokens/semantic.mjs) *are* this theme.
 *   retro     the 2008 portal all the way: Verdana 12px, 24px square
 *             controls, bevelled gradient buttons, tight boxes.
 *
 * Light/dark mode and density work with both. A theme is a list of overrides
 * on top of the base tokens:
 *   primitives  foundation primitives, e.g. { 'text-md': '0.75rem' }
 *   roles       role tokens, e.g. { 'radius-panel': '0' }
 *   colors      semantic colours, e.g. { canvas: { light: 'frame.200', dark: 'neutral.1000' } }
 *
 * Apply with <html data-theme="retro">, or on any element to theme a
 * subtree. The default theme also applies when no data-theme is set.
 * How to add one: docs/theming.md.
 */

export const defaultTheme = 'standard';

export const themes = {
  standard: {
    label: 'Standard',
    description: 'The default. The 2008 layout with today\'s controls: Arial 13px, saturated frame, square boxes, flat buttons with 3px corners.',
  },
  retro: {
    label: 'Retro',
    description: 'The 2008 portal all the way: Verdana 12px, 24px square controls, bevelled buttons, tight boxes.',
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
      pad: '0.625rem',
      'row-pad': '0.25rem',
      'radius-control': '0',
      'radius-tab': '0',
      'radius-badge': '0',
      'control-height': '1.5rem',
      'control-height-sm': '1.5rem',
      'control-height-lg': '1.875rem',
      'control-pad-x': '0.5rem',
      'button-retro': '1',
    },
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
