import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CANOPY_MAX_HALF_WIDTH,
  CANOPY_ROWS,
} from "../canopy/constants.ts";
import {
  HEIGHT_PER_EXTRA_SEED,
  SEED_COUNT_MAX,
  TRUNK_HALF_WIDTH,
  TRUNK_HALF_WIDTH_MAX,
  TRUNK_HEIGHT,
} from "./constants.ts";
import {
  canopyMaxHalfForHalfWidth,
  canopyRowsForHalfWidth,
  halfWidthForSeedCount,
  seedCountAfterMerge,
  storedSeedCount,
  targetHeightForSeedCount,
} from "./size.ts";

test("one seed is 72 cells tall with the base cone", () => {
  assert.equal(targetHeightForSeedCount(1), TRUNK_HEIGHT);
  assert.equal(halfWidthForSeedCount(1), TRUNK_HALF_WIDTH);
  assert.equal(canopyRowsForHalfWidth(TRUNK_HALF_WIDTH), CANOPY_ROWS);
  assert.equal(canopyMaxHalfForHalfWidth(TRUNK_HALF_WIDTH), CANOPY_MAX_HALF_WIDTH);
});

test("each extra seed adds height", () => {
  assert.equal(targetHeightForSeedCount(2), TRUNK_HEIGHT + HEIGHT_PER_EXTRA_SEED);
  assert.equal(targetHeightForSeedCount(3), TRUNK_HEIGHT + 2 * HEIGHT_PER_EXTRA_SEED);
  assert.ok(targetHeightForSeedCount(SEED_COUNT_MAX) > targetHeightForSeedCount(4));
});

test("trunk width follows seed count until the width cap", () => {
  assert.equal(halfWidthForSeedCount(1), TRUNK_HALF_WIDTH);
  assert.equal(halfWidthForSeedCount(4), TRUNK_HALF_WIDTH_MAX);
  assert.equal(halfWidthForSeedCount(8), TRUNK_HALF_WIDTH_MAX);
});

test("storedSeedCount rejects values outside 1–max", () => {
  assert.equal(storedSeedCount(1), 1);
  assert.equal(storedSeedCount(SEED_COUNT_MAX), SEED_COUNT_MAX);
  assert.equal(storedSeedCount(0), 1);
  assert.equal(storedSeedCount(69), 1);
});

test("seedCountAfterMerge adds one seed and stays inside the cap", () => {
  assert.equal(seedCountAfterMerge(1, 10, 10), 2);
  assert.equal(seedCountAfterMerge(1, 10, 12), 2);
  assert.equal(seedCountAfterMerge(SEED_COUNT_MAX, 10, 12), SEED_COUNT_MAX);
});
