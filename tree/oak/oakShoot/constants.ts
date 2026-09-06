import { DEBUG } from "../acorn/constants.ts";

/** Mature oak trunk height in cells, including the root. */
export const TRUNK_HEIGHT = 48;

/** Extra columns on each side of the center. Total width is `2 * half + 1`. */
export const TRUNK_HALF_WIDTH = 2;

/** Widest half-width at the root when the tree is mature. Total width is `2 * half + 1`. */
export const TRUNK_BASE_MAX_HALF = 4;

/** Rows above the root that can be wider than the mid trunk. */
export const TRUNK_BASE_FLARE_ROWS = 6;

/** Height progress before the base starts to widen (0–1). */
export const TRUNK_BASE_GROW_START = 0.45;

/** 1-wide tip: this many cells from the top of the trunk. */
export const TRUNK_TAPER_ROWS = 6;

/** Ticks between growth steps. */
export const GROW_DURATION_TICKS = 1;

/** Trunk rows placed in one duration tick. More when `acorn` DEBUG is on. */
export const TRUNK_GROW_ROWS_PER_TICK = DEBUG ? 12 : 1;

/** Extra half-width at the root for this trunk height. */
export function trunkBaseExtraHalf(placedHeight: number): number {
  const t = Math.min(1, placedHeight / TRUNK_HEIGHT);
  const span = 1 - TRUNK_BASE_GROW_START;
  const delayed = span <= 0 ? t : Math.max(0, (t - TRUNK_BASE_GROW_START) / span);
  return Math.round(delayed * (TRUNK_BASE_MAX_HALF - TRUNK_HALF_WIDTH));
}

/** Half-width of a flare row, counting up from the root. */
export function trunkHalfWidthFromRoot(dyFromRoot: number, extraHalf: number): number {
  if (extraHalf <= 0 || dyFromRoot >= TRUNK_BASE_FLARE_ROWS) return TRUNK_HALF_WIDTH;
  const span = Math.max(1, TRUNK_BASE_FLARE_ROWS - 1);
  const extra = Math.round((1 - dyFromRoot / span) * extraHalf);
  return TRUNK_HALF_WIDTH + extra;
}

/** Half-width of the trunk at this height, counting from the root. */
export function trunkHalfWidthAt(placedHeight: number): number {
  const fromTop = TRUNK_HEIGHT - placedHeight;
  if (fromTop >= TRUNK_TAPER_ROWS) return TRUNK_HALF_WIDTH;
  return 0;
}
