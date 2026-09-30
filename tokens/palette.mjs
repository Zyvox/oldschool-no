/**
 * Palette — the raw material.
 *
 * Every chromatic ramp is generated from an OKLCH hue + peak chroma (see
 * src/js/color.js for the lightness/chroma curves). Names are Norwegian
 * nature words; each ramp has the same lightness per step, so ramps are
 * interchangeable inside themes.
 *
 * To add a ramp: add an entry below and run `npm run build`.
 * To preview ramps: open site/tokens.html.
 */

/** Chromatic ramps (steps 50–950). */
export const accents = {
  fjord: {
    hue: 256, chroma: 0.15, hueShift: -6,
    description: 'Deep fjord blue. The default accent and the info color.',
  },
  blekk: {
    hue: 262, chroma: 0.075, hueShift: 0,
    description: 'Blekk (ink). A quiet navy for print-like, low-color themes.',
  },
  nordlys: {
    hue: 196, chroma: 0.1, hueShift: 10,
    description: 'Nordlys (aurora). Cold teal.',
  },
  furu: {
    hue: 158, chroma: 0.1, hueShift: 8,
    description: 'Furu (pine). Dark forest green.',
  },
  mose: {
    hue: 142, chroma: 0.13, hueShift: 6,
    description: 'Mose (moss). Success.',
  },
  multe: {
    hue: 68, chroma: 0.15, hueShift: 14,
    description: 'Multe (cloudberry). Warning and highlights.',
  },
  tyttebaer: {
    hue: 24, chroma: 0.17, hueShift: 4,
    description: 'Tyttebær (lingonberry). Danger, and a warm accent.',
  },
  lyng: {
    hue: 322, chroma: 0.13, hueShift: -6,
    description: 'Lyng (heather). Visited links, and an accent.',
  },
};

/** Neutral ramps (steps 0–1000). Low-chroma greys with a temperature. */
export const neutrals = {
  is: {
    hue: 248, chroma: 0.014,
    description: 'Is (ice). Cool, slightly blue grey.',
  },
  granitt: {
    hue: 260, chroma: 0.004,
    description: 'Granitt (granite). Almost pure grey.',
  },
  sand: {
    hue: 78, chroma: 0.012,
    description: 'Sand. Warm, paper-like grey.',
  },
};

/**
 * Hand-picked ramps that are *not* generated. `retro` recreates the look of
 * mid-2000s Norwegian classifieds (link blue, pale-blue frame, plain greys).
 */
export const fixed = {
  retroBlue: {
    description: 'Mid-2000s link blue and pale frame blue.',
    ramp: {
      50: '#eef4fb', 100: '#dce8f6', 200: '#c6daf0', 300: '#a2c1e6', 400: '#6f9bd4',
      500: '#3f74c2', 600: '#1f55ad', 700: '#123f94', 800: '#0d3077', 900: '#0a2459', 950: '#061838',
    },
  },
  retroGray: {
    description: 'Plain greys, no tint.',
    ramp: {
      0: '#ffffff', 25: '#fbfbfb', 50: '#f6f6f6', 100: '#efefef', 150: '#e6e6e6', 200: '#dddddd',
      300: '#cccccc', 400: '#8f8f8f', 500: '#737373', 600: '#5e5e5e', 700: '#4d4d4d',
      800: '#383838', 850: '#2c2c2c', 900: '#222222', 950: '#1a1a1a', 1000: '#111111',
    },
  },
};
