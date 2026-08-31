/** Mature pine trunk height in cells for one seed, including the root. */
export const TRUNK_HEIGHT = 72;

/** Extra columns on each side of the center for one seed. Total width is `2 * half + 1`. */
export const TRUNK_HALF_WIDTH = 2;

/** Widest trunk half-width after extra seeds merge into one tree. */
export const TRUNK_HALF_WIDTH_MAX = 5;

/** Most seeds that can merge into one pine. Height scales with this count. */
export const SEED_COUNT_MAX = 8;

/** Extra mature height per extra seed. */
export const HEIGHT_PER_EXTRA_SEED = 24;

/** Tallest possible trunk. Used for harvest and canopy search. */
export const TRUNK_HEIGHT_MAX =
  TRUNK_HEIGHT + (SEED_COUNT_MAX - 1) * HEIGHT_PER_EXTRA_SEED;

/** Ticks between growth steps. Duration keeps the Static shoot in the sim after the chunk idles. */
export const GROW_DURATION_TICKS = 1;

/** Trunk rows placed in one duration tick. */
export const TRUNK_GROW_ROWS_PER_TICK = 1;

export const PHASE = {
  growingTrunk: 0,
  growingCanopy: 1,
  mature: 2,
} as const;
