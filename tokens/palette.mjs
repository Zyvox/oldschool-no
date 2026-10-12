/**
 * Palette — every colour in Oldschool grows from the seeds in this file.
 *
 * To re-brand a clone, change `accent` and run `npm run build`. The build
 * turns each seed into a ramp (steps 50–950) with fixed OKLCH lightness per
 * step, so contrast holds whatever colour you pick: step 700 is always safe
 * for links on white, step 600 always carries white button text, and so on.
 * `npm test` re-checks every contrast pair and fails if a seed breaks one.
 *
 * A seed is either
 *   '#2a5aa8'                                any CSS hex colour — its hue and
 *                                            colourfulness are kept, lightness
 *                                            is set per step; or
 *   { hue: 260, chroma: 0.15, hueShift: -4 } OKLCH hue (0–360), peak chroma
 *                                            (≈0.04 muted … 0.2 vivid) and an
 *                                            optional hue drift from light to dark.
 *
 * Pick a mid-tone (a button colour, not a background tint) as the seed.
 * Recipes for other brands are in docs/theming.md.
 */

/** The one brand colour: buttons, links, focus, selected states. */
export const accent = '#2a5aa8';

/**
 * The frame, header bands, crumb bar, tabs and zebra rows.
 *   null                          the accent — the 2008 look: a blue site is
 *                                 blue all over (the default);
 *   { hue: 80, chroma: 0.02 }     a near-grey (stone) — the modern look: the
 *                                 accent only on what you can click;
 *   { chroma: 0.02 }              a near-grey leaning to the accent's hue;
 *   any seed                      a second colour.
 * The lightness of each step is fixed, so contrast holds either way.
 */
export const frame = null;

/**
 * Greys for text, surfaces and rules. They borrow the frame's hue (so the
 * accent's, by default) at this chroma. 0 = pure grey; 0.012 = clearly
 * tinted. Give `hue` to tint towards something else.
 */
export const neutral = { chroma: 0.008 };

/**
 * Link colour. null = use the accent ramp (the default). Set a seed when the
 * brand colour is not a good link colour — e.g. a green or orange brand with
 * the classic blue links of the era: link = '#2a5aa8'.
 */
export const link = null;

/** Visited links: the classic purple. */
export const visited = { hue: 305, chroma: 0.12, hueShift: -6 };

/**
 * Status colours. Keep them recognisable whatever the accent is.
 * `note` is the pale post-it yellow behind notices and <mark>.
 */
export const status = {
  success: { hue: 140, chroma: 0.13, hueShift: 6 },
  warning: { hue: 62, chroma: 0.13, hueShift: 12 },
  danger: { hue: 26, chroma: 0.17, hueShift: 4 },
  info: { hue: 254, chroma: 0.13, hueShift: -4 },
  note: { hue: 100, chroma: 0.3, hueShift: -12 },
};
