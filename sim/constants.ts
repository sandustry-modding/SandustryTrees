/** Mature pine trunk height in cells for one seed, including the root. */
export const TRUNK_HEIGHT = 48;

/** Extra columns on each side of the center for one seed. Total width is `2 * half + 1`. */
export const TRUNK_HALF_WIDTH = 1;

/** Widest trunk half-width after extra seeds merge into one tree. */
export const TRUNK_HALF_WIDTH_MAX = 4;

/** Most seeds that can merge into one pine. Height scales with this count. */
export const SEED_COUNT_MAX = 8;

/** Extra mature height per extra seed. */
export const HEIGHT_PER_EXTRA_SEED = 16;

/** Tallest possible trunk. Used for harvest and canopy search. */
export const TRUNK_HEIGHT_MAX =
  TRUNK_HEIGHT + (SEED_COUNT_MAX - 1) * HEIGHT_PER_EXTRA_SEED;

/** PineNeedle rows on the upper trunk for one seed (upper ~60%). */
export const CANOPY_ROWS = 28;

/** Extra needle rows per extra trunk half-width. */
export const CANOPY_ROWS_PER_EXTRA_HALF = 8;

/** Needles on each side of the trunk at the bottom of the canopy for one seed. */
export const CANOPY_MAX_HALF_WIDTH = 12;

/** Extra canopy half-width per extra trunk half-width. */
export const CANOPY_HALF_PER_EXTRA_HALF = 6;

/** Cells above the top trunk row where the needle tip sits. One cell is 4 pixels. */
export const CANOPY_TIP_OFFSET_CELLS = 8;

/** Trunk cells that must exist before needles spawn. Stops a green tuft on the soil. */
export const CANOPY_MIN_TRUNK_HEIGHT = 16;

/** Ticks between growth steps. Duration keeps the Static shoot in the sim after the chunk idles. */
export const GROW_DURATION_TICKS = 1;

/** Trunk rows placed in one duration tick. */
export const TRUNK_GROW_ROWS_PER_TICK = 1;

/** Resting LeafDust ticks before the cell becomes Dirt terrain. */
export const COMPOST_REST_TICKS = 180;

/** Chance for a second Pine Seed when a trunk is harvested. */
export const SECOND_SEED_CHANCE = 0.01;

/** Neighbor speed that counts as mechanical force on needles. */
export const MECHANICAL_SPEED = 40;

/** Static Flame lifetime on sealed Raw Wood before Charcoal (seconds). */
export const WOOD_FLAME_DURATION_SEC: readonly [number, number] = [2, 2];

/** Ticks before a primed Raw Wood neighbor ignites (crawl spread). */
export const WOOD_SPREAD_DELAY_TICKS = 45;

/** Engine skipPhysics value that pins Flame in place (static burn). */
export const PHYSICS_SKIP = 1;

export const FIELD = {
  rootX: 1,
  rootY: 2,
  trunkHeight: 3,
  phase: 4,
  /** Raw Wood only: 1 = scheduled to ignite from a burning neighbor. */
  ignitePrime: 1,
} as const;

export const PHASE = {
  growingTrunk: 0,
  growingCanopy: 1,
  mature: 2,
} as const;

export const ORTHO8_DIRS: readonly [number, number][] = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

export const CARDINAL_DIRS: readonly [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
