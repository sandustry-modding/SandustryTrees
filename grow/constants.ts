import { CANOPY_MIN_TRUNK_HEIGHT } from "../canopy/constants.ts";

/** Mature pine trunk height in cells, including the root. */
export const TRUNK_HEIGHT = 72;

/** Extra columns on each side of the center. Total width is `2 * half + 1`. */
export const TRUNK_HALF_WIDTH = 1;

/** 1-wide tip starts halfway through the needle zone. */
export const TRUNK_TAPER_ROWS = Math.floor((TRUNK_HEIGHT - CANOPY_MIN_TRUNK_HEIGHT) / 2);

/** Ticks between growth steps. */
export const GROW_DURATION_TICKS = 1;

/** Half-width of the trunk at this height, counting from the root. */
export function trunkHalfWidthAt(placedHeight: number): number {
  const fromTop = TRUNK_HEIGHT - placedHeight;
  if (fromTop >= TRUNK_TAPER_ROWS) return TRUNK_HALF_WIDTH;
  return 0;
}
