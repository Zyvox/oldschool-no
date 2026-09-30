/**
 * Semantic colors — what a color is *for*.
 *
 * Each role maps to a step of one of the theme's ramps, once for light and
 * once for dark mode. The build emits them as
 *
 *   --os-color-link: light-dark(var(--os-accent-700), var(--os-accent-300));
 *
 * so the active theme decides the hue (which ramp) and the inherited
 * `color-scheme` decides light vs. dark — independently, on any subtree.
 *
 * Reference syntax:
 *   'accent.700'           step 700 of the theme's accent ramp
 *   'neutral.0'            neutral ramps run 0 (white) … 1000 (near-black)
 *   'visited.700'          ramp used for visited links (theme-selectable)
 *   'success.600' …        status ramps: success, warning, danger, info
 *   'mix(neutral.1000 8%)' that color at 8% opacity
 *   '=border'              alias of another semantic color
 *   anything else          literal CSS color (e.g. 'transparent')
 */

const status = (name, label) => [
  { name, light: `${name}.700`, dark: `${name}.300`, description: `${label} text and icons.` },
  { name: `${name}-fill`, light: `${name}.600`, dark: `${name}.400`, description: `Solid ${label.toLowerCase()} fills (pair with text-on-accent).` },
  { name: `${name}-subtle`, light: `${name}.50`, dark: `${name}.950`, description: `${label} message backgrounds.` },
  { name: `${name}-border`, light: `${name}.200`, dark: `${name}.800`, description: `${label} message borders.` },
];

export const colorGroups = [
  {
    group: 'Surface',
    colors: [
      { name: 'canvas', light: 'neutral.100', dark: 'neutral.1000', description: 'Page background — the calm frame that panels sit on.' },
      { name: 'surface', light: 'neutral.0', dark: 'neutral.950', description: 'Panels, cards and form fields.' },
      { name: 'surface-raised', light: 'neutral.0', dark: 'neutral.900', description: 'Menus, popovers, dialogs and sticky bars.' },
      { name: 'surface-sunken', light: 'neutral.50', dark: 'neutral.1000', description: 'Wells and code blocks inside panels.' },
      { name: 'surface-muted', light: 'neutral.25', dark: 'neutral.900', description: 'Hover rows, zebra stripes and quiet fills.' },
      { name: 'surface-tint', light: 'accent.50', dark: 'accent.950', description: 'Panel header bands, crumb bar and selected rows.' },
      { name: 'surface-tint-strong', light: 'accent.100', dark: 'accent.900', description: 'Pressed or current tinted fills.' },
      { name: 'surface-inverse', light: 'neutral.900', dark: 'neutral.50', description: 'Toasts, tooltips and inverse chips.' },
    ],
  },
  {
    group: 'Text',
    colors: [
      { name: 'text', light: 'neutral.900', dark: 'neutral.50', description: 'Body text.' },
      { name: 'text-strong', light: 'neutral.1000', dark: 'neutral.0', description: 'Headings, values and prices.' },
      { name: 'text-muted', light: 'neutral.600', dark: 'neutral.400', description: 'Labels, meta and secondary text. AA on every surface.' },
      { name: 'text-subtle', light: 'neutral.500', dark: 'neutral.400', description: 'Placeholders and captions. AA on surface.' },
      { name: 'text-inverse', light: 'neutral.0', dark: 'neutral.1000', description: 'Text on surface-inverse.' },
      { name: 'text-on-accent', light: 'neutral.0', dark: 'neutral.1000', description: 'Text and icons on accent and status fills.' },
      { name: 'text-accent', light: 'accent.700', dark: 'accent.300', description: 'Accent-colored text: eyebrows, active navigation.' },
    ],
  },
  {
    group: 'Link',
    colors: [
      { name: 'link', light: 'accent.700', dark: 'accent.300', description: 'Links. Underlined wherever they sit in content.' },
      { name: 'link-hover', light: 'accent.800', dark: 'accent.200', description: 'Hovered links.' },
      { name: 'link-visited', light: 'visited.700', dark: 'visited.300', description: 'Visited links in content and result lists.' },
    ],
  },
  {
    group: 'Border',
    colors: [
      { name: 'border', light: 'neutral.200', dark: 'neutral.800', description: 'Panel outlines and dividers.' },
      { name: 'border-subtle', light: 'neutral.150', dark: 'neutral.850', description: 'Hairlines inside panels (key/value rows).' },
      { name: 'border-strong', light: 'neutral.400', dark: 'neutral.500', description: 'Form control outlines — at least 3:1 against surface.' },
      { name: 'border-tint', light: 'accent.100', dark: 'accent.900', description: 'Edges of tinted bands.' },
    ],
  },
  {
    group: 'Accent',
    colors: [
      { name: 'accent', light: 'accent.600', dark: 'accent.400', description: 'Primary buttons, checked controls and brand fills.' },
      { name: 'accent-hover', light: 'accent.700', dark: 'accent.300', description: 'Hovered accent fills.' },
      { name: 'accent-active', light: 'accent.800', dark: 'accent.200', description: 'Pressed accent fills.' },
      { name: 'accent-subtle', light: 'accent.50', dark: 'accent.950', description: 'Selected-state backgrounds.' },
      { name: 'accent-muted', light: 'accent.100', dark: 'accent.900', description: 'Stronger selected states and accent badges.' },
      { name: 'focus', light: 'accent.600', dark: 'accent.400', description: 'Focus ring.' },
      { name: 'selection', light: 'accent.100', dark: 'accent.800', description: 'Text selection background.' },
    ],
  },
  { group: 'Success', colors: status('success', 'Success') },
  { group: 'Warning', colors: status('warning', 'Warning') },
  { group: 'Danger', colors: status('danger', 'Danger') },
  { group: 'Info', colors: status('info', 'Info') },
  {
    group: 'Misc',
    colors: [
      { name: 'highlight', light: 'warning.100', dark: 'warning.900', description: '<mark> and matched search terms.' },
      { name: 'saved', light: 'danger.600', dark: 'danger.400', description: 'Filled heart/star on saved items.' },
      { name: 'overlay', light: 'mix(neutral.1000 45%)', dark: 'mix(neutral.1000 72%)', description: 'Backdrop behind dialogs and sheets.' },
      { name: 'shadow', light: 'mix(neutral.1000 8%)', dark: 'mix(neutral.1000 50%)', description: 'Soft shadow color.' },
      { name: 'shadow-strong', light: 'mix(neutral.1000 18%)', dark: 'mix(neutral.1000 70%)', description: 'Strong shadow color.' },
    ],
  },
  {
    group: 'Component',
    colors: [
      { name: 'masthead', light: 'transparent', dark: 'transparent', description: 'Masthead background (sits on the canvas by default).' },
      { name: 'crumbbar', light: '=surface', dark: '=surface', description: 'Crumb bar (breadcrumbs + pager) background.' },
      { name: 'panel-border', light: '=border', dark: '=border', description: 'Panel outline.' },
      { name: 'panel-header', light: '=surface-tint', dark: '=surface-tint', description: 'Panel header band.' },
      { name: 'panel-header-border', light: '=border-subtle', dark: '=border', description: 'Line under the panel header band.' },
      { name: 'price', light: '=text-strong', dark: '=text-strong', description: 'Prices and key figures.' },
    ],
  },
];

/** Contrast requirements checked by `npm run check` for every theme × mode. */
export const contrastPairs = [
  // [foreground, background, minimum ratio, note]
  ['text', 'surface', 4.5],
  ['text', 'canvas', 4.5],
  ['text-strong', 'surface', 4.5],
  ['text-muted', 'surface', 4.5],
  ['text-muted', 'canvas', 4.5],
  ['text-muted', 'surface-tint', 4.5],
  ['text-muted', 'surface-sunken', 4.5],
  ['text-subtle', 'surface', 4.5],
  ['text', 'surface-tint', 4.5],
  ['text', 'surface-raised', 4.5],
  ['text-inverse', 'surface-inverse', 4.5],
  ['text-accent', 'surface', 4.5],
  ['link', 'surface', 4.5],
  ['link', 'canvas', 4.5],
  ['link', 'surface-tint', 4.5],
  ['link', 'surface-muted', 4.5],
  ['link-hover', 'surface', 4.5],
  ['link-visited', 'surface', 4.5],
  ['text-on-accent', 'accent', 4.5],
  ['text-on-accent', 'accent-hover', 4.5],
  ['text-on-accent', 'success-fill', 4.5],
  ['text-on-accent', 'warning-fill', 4.5],
  ['text-on-accent', 'danger-fill', 4.5],
  ['text-on-accent', 'info-fill', 4.5],
  ['text', 'accent-subtle', 4.5],
  ['text', 'accent-muted', 4.5],
  ['success', 'success-subtle', 4.5],
  ['warning', 'warning-subtle', 4.5],
  ['danger', 'danger-subtle', 4.5],
  ['info', 'info-subtle', 4.5],
  ['success', 'surface', 4.5],
  ['danger', 'surface', 4.5],
  ['text', 'highlight', 4.5],
  ['border-strong', 'surface', 3, 'WCAG 1.4.11 non-text contrast for control outlines'],
  ['focus', 'surface', 3, 'WCAG 2.4.13 focus appearance'],
  ['focus', 'canvas', 3],
  ['accent', 'surface', 3, 'Checked checkbox/radio against surface'],
];
