/**
 * Oldschool — color engine
 *
 * Pure functions (no DOM) shared by the Node build and the accent playground
 * on the themes page: OKLCH ⇄ sRGB conversion, sRGB gamut mapping, ramp generation and
 * WCAG 2.x contrast.
 *
 * Why OKLCH: lightness in OKLCH is perceptually even, so a ramp generated from
 * fixed lightness targets gives every hue the same contrast behaviour. That is
 * what makes color schemes swappable: step 700 of *any* accent ramp is safe
 * for link text on white, step 600 is safe behind white button labels, etc.
 */

/* ---------------------------------------------------------------------------
 * Ramp definitions
 * ------------------------------------------------------------------------ */

/** Steps of an accent (chromatic) ramp. */
export const ACCENT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/** OKLCH lightness per accent step. Tuned for WCAG contrast margins. */
export const ACCENT_LIGHTNESS = {
  50: 0.972, 100: 0.93, 200: 0.87, 300: 0.8, 400: 0.71, 500: 0.62,
  600: 0.535, 700: 0.46, 800: 0.39, 900: 0.32, 950: 0.255,
};

/** Chroma per accent step, relative to the ramp's peak chroma. */
export const ACCENT_CHROMA = {
  50: 0.1, 100: 0.2, 200: 0.36, 300: 0.68, 400: 0.86, 500: 1,
  600: 1, 700: 0.9, 800: 0.78, 900: 0.64, 950: 0.5,
};

/** Steps of a neutral ramp. 0 is always pure white. */
export const NEUTRAL_STEPS = [0, 25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950, 1000];

/** OKLCH lightness per neutral step. */
export const NEUTRAL_LIGHTNESS = {
  0: 1, 25: 0.985, 50: 0.97, 100: 0.95, 150: 0.925, 200: 0.895, 300: 0.83,
  400: 0.66, 500: 0.555, 600: 0.48, 700: 0.41, 800: 0.345, 850: 0.3,
  900: 0.26, 950: 0.222, 1000: 0.185,
};

/** Chroma per neutral step, relative to the ramp's peak chroma. */
export const NEUTRAL_CHROMA = {
  0: 0, 25: 0.3, 50: 0.45, 100: 0.6, 150: 0.7, 200: 0.8, 300: 0.9, 400: 1,
  500: 1, 600: 1, 700: 1, 800: 0.95, 850: 0.9, 900: 0.85, 950: 0.8, 1000: 0.75,
};

/* ---------------------------------------------------------------------------
 * Conversions
 * ------------------------------------------------------------------------ */

const DEG = Math.PI / 180;

export function oklchToOklab([L, C, h]) {
  return [L, C * Math.cos(h * DEG), C * Math.sin(h * DEG)];
}

export function oklabToOklch([L, a, b]) {
  const C = Math.hypot(a, b);
  let h = Math.atan2(b, a) / DEG;
  if (h < 0) h += 360;
  return [L, C, C < 1e-4 ? 0 : h];
}

export function oklabToLinearSrgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function linearSrgbToOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const encode = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const decode = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const clamp01 = (c) => Math.min(1, Math.max(0, c));

function inGamut(linear, eps = 1e-7) {
  return linear.every((c) => c >= -eps && c <= 1 + eps);
}

/**
 * Convert OKLCH to a hex string, reducing chroma (never lightness or hue)
 * until the color fits inside sRGB.
 */
export function oklchToHex(L, C, h) {
  const toLinear = (chroma) => oklabToLinearSrgb(oklchToOklab([L, chroma, h]));
  let linear = toLinear(C);
  if (!inGamut(linear)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 30; i += 1) {
      const mid = (lo + hi) / 2;
      if (inGamut(toLinear(mid))) lo = mid;
      else hi = mid;
    }
    linear = toLinear(lo);
  }
  return rgbToHex(linear.map((c) => encode(clamp01(c))));
}

export function rgbToHex(rgb) {
  return `#${rgb.map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function hexToRgb(hex) {
  let value = hex.replace('#', '').trim();
  if (value.length === 3) value = [...value].map((c) => c + c).join('');
  const n = Number.parseInt(value.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}

export function hexToOklch(hex) {
  return oklabToOklch(linearSrgbToOklab(hexToRgb(hex).map(decode)));
}

/* ---------------------------------------------------------------------------
 * WCAG contrast
 * ------------------------------------------------------------------------ */

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(decode);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------------------------------------------------------------------------
 * Ramps
 * ------------------------------------------------------------------------ */

/**
 * Generate an accent ramp.
 * @param {object} spec
 * @param {number} spec.hue       OKLCH hue in degrees (0–360)
 * @param {number} spec.chroma    Peak chroma (≈0.04 muted … 0.2 vivid)
 * @param {number} [spec.hueShift] Degrees the hue drifts from light (+) to dark (−) end
 * @returns {Record<number,string>} step → hex
 */
export function accentRamp({ hue, chroma, hueShift = 0 }) {
  const ramp = {};
  ACCENT_STEPS.forEach((step, i) => {
    const t = i / (ACCENT_STEPS.length - 1); // 0 (light) … 1 (dark)
    const h = (hue + hueShift * (0.5 - t) + 360) % 360;
    ramp[step] = oklchToHex(ACCENT_LIGHTNESS[step], chroma * ACCENT_CHROMA[step], h);
  });
  return ramp;
}

/**
 * Generate a neutral ramp (tinted grey).
 * @param {object} spec
 * @param {number} spec.hue     Tint hue in degrees
 * @param {number} spec.chroma  Peak tint chroma (0 = pure grey, ≈0.015 = clearly tinted)
 */
export function neutralRamp({ hue, chroma }) {
  const ramp = {};
  NEUTRAL_STEPS.forEach((step) => {
    ramp[step] = oklchToHex(NEUTRAL_LIGHTNESS[step], chroma * NEUTRAL_CHROMA[step], hue);
  });
  return ramp;
}

/* ---------------------------------------------------------------------------
 * Seeds → scheme (shared by the build and the accent playground)
 * ------------------------------------------------------------------------ */

/**
 * Normalise a seed to an accent-ramp spec. A hex seed keeps its hue; its
 * chroma is scaled up to the ramp's peak from the step whose lightness is
 * nearest, so a pale tint and a strong mid-tone of one colour give one ramp.
 * @param {string | {hue:number, chroma:number, hueShift?:number}} seed
 */
export function seedSpec(seed) {
  if (typeof seed !== 'string') return { hueShift: 0, ...seed };
  const [L, C, h] = hexToOklch(seed);
  let nearest = 500;
  for (const step of ACCENT_STEPS) {
    if (Math.abs(ACCENT_LIGHTNESS[step] - L) < Math.abs(ACCENT_LIGHTNESS[nearest] - L)) nearest = step;
  }
  const chroma = Math.min(0.3, C / ACCENT_CHROMA[nearest]);
  return { hue: Math.round(h * 10) / 10, chroma: Math.round(chroma * 1000) / 1000, hueShift: 0 };
}

/**
 * Every ramp of a colour scheme from its seeds (see tokens/palette.mjs).
 * `frame` (the frame, header bands, tabs and zebra rows) is the accent ramp
 * unless a frame seed is given; a frame seed without a hue takes the accent's.
 * The greys follow the frame's hue unless `neutral.hue` says otherwise.
 * @returns {{accent, frame, neutral, link?, visited, success, warning, danger, info, note}} name → {step → hex}
 */
export function schemeFromSeeds({ accent, frame = null, neutral = { chroma: 0.008 }, link = null, visited, status = {} }) {
  const a = seedSpec(accent);
  const f = frame ? seedSpec(typeof frame === 'string' ? frame : { hue: a.hue, ...frame }) : a;
  const out = {
    accent: accentRamp(a),
    frame: accentRamp(f),
    neutral: neutralRamp({ hue: neutral.hue ?? f.hue, chroma: neutral.chroma ?? 0.008 }),
  };
  if (link) out.link = accentRamp(seedSpec(link));
  if (visited) out.visited = accentRamp(seedSpec(visited));
  for (const [name, seed] of Object.entries(status)) out[name] = accentRamp(seedSpec(seed));
  return out;
}
