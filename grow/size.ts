import {
  CANOPY_HALF_PER_EXTRA_HALF,
  CANOPY_MAX_HALF_WIDTH,
  CANOPY_ROWS,
  CANOPY_ROWS_PER_EXTRA_HALF,
} from "../canopy/constants.ts";
import {
  HEIGHT_PER_EXTRA_SEED,
  SEED_COUNT_MAX,
  TRUNK_HALF_WIDTH,
  TRUNK_HALF_WIDTH_MAX,
  TRUNK_HEIGHT,
} from "./constants.ts";

export function storedSeedCount(value: number): number {
  if (value >= 1 && value <= SEED_COUNT_MAX) return Math.floor(value);
  return 1;
}

export function extraSeeds(seedCount: number): number {
  return Math.max(0, storedSeedCount(seedCount) - 1);
}

export function halfWidthForSeedCount(seedCount: number): number {
  return Math.min(TRUNK_HALF_WIDTH_MAX, TRUNK_HALF_WIDTH + extraSeeds(seedCount));
}

export function storedHalfWidth(value: number): number {
  const n = Math.floor(value);
  if (n >= 1 && n <= TRUNK_HALF_WIDTH_MAX) return n;
  return TRUNK_HALF_WIDTH;
}

/** How many half-columns wider than the one-seed trunk. */
export function extraHalfFromBase(halfWidth: number): number {
  return Math.max(0, storedHalfWidth(halfWidth) - TRUNK_HALF_WIDTH);
}

export function targetHeightForSeedCount(seedCount: number): number {
  return TRUNK_HEIGHT + extraSeeds(seedCount) * HEIGHT_PER_EXTRA_SEED;
}

export function targetHeightForHalfWidth(halfWidth: number): number {
  return TRUNK_HEIGHT + extraHalfFromBase(halfWidth) * HEIGHT_PER_EXTRA_SEED;
}

export function canopyRowsForHalfWidth(halfWidth: number): number {
  return CANOPY_ROWS + extraHalfFromBase(halfWidth) * CANOPY_ROWS_PER_EXTRA_HALF;
}

export function canopyMaxHalfForHalfWidth(halfWidth: number): number {
  return CANOPY_MAX_HALF_WIDTH + extraHalfFromBase(halfWidth) * CANOPY_HALF_PER_EXTRA_HALF;
}

export function seedCountAfterMerge(seedCount: number, rootX: number, extraX: number): number {
  const cover = Math.abs(extraX - rootX);
  const next = Math.max(storedSeedCount(seedCount) + 1, cover);
  return Math.min(SEED_COUNT_MAX, next);
}
