/**
 * Colour recipes — tried palettes for tokens/palette.mjs. Not used by the
 * build; the themes page shows them and `npm test` checks every one against
 * every contrast pair, so each is safe to paste.
 *
 * Portal blue is the 2008 look: the frame is the accent, so the site is blue
 * all over. Portal grey is the same blue on a grey frame. The others too are
 * the modern look: a near-grey frame and header
 * bands, and the colour only on buttons, links, focus and selected states.
 */

/** Frame seeds. null = the accent. */
export const frames = {
  accent: null,
  stone: { hue: 80, chroma: 0.02 },   // warm grey
  steel: { hue: 250, chroma: 0.02 },  // cool grey
  grey: { chroma: 0 },
};

/** name, accent seed, frame (a key of `frames`), link seed (null = the accent). */
export const recipes = [
  { name: 'Portal blue', accent: '#2a5aa8', frame: 'accent', link: null },
  { name: 'Portal grey', accent: '#2a5aa8', frame: 'steel', link: null },
  { name: 'Forest', accent: '#2f6b3f', frame: 'stone', link: null },
  { name: 'Fjord', accent: '#0f6e6a', frame: 'steel', link: null },
  { name: 'Clay', accent: '#b4532a', frame: 'stone', link: null },
  { name: 'Indigo', accent: '#4b47c9', frame: 'steel', link: null },
  { name: 'Graphite', accent: '#3d4654', frame: 'grey', link: '#2a5aa8' },
];
