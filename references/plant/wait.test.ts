import assert from "node:assert/strict";
import { test } from "node:test";
import { HEIGHT_PER_EXTRA_SEED, SEED_COUNT_MAX, TRUNK_HEIGHT } from "../grow/constants.ts";
import { targetHeightForSeedCount } from "../grow/size.ts";
import { SEED_ABSORB_RADIUS, SEED_ABSORB_WAIT_TICKS } from "./constants.ts";
import {
  absorbCellOffsets,
  absorbWaitRemaining,
  initialAbsorbProgress,
  isAbsorbWaiting,
  nextAbsorbProgress,
  nextSeedCountFromPositions,
} from "./wait.ts";

test("absorb window is 7×7 around the root", () => {
  const cells = absorbCellOffsets();
  assert.equal(SEED_ABSORB_RADIUS, 3);
  assert.equal(cells.length, 7 * 7);
  assert.ok(cells.some((cell) => cell.dx === -3 && cell.dy === -3));
  assert.ok(cells.some((cell) => cell.dx === 3 && cell.dy === 3));
  assert.ok(cells.some((cell) => cell.dx === 0 && cell.dy === 0));
});

test("initial absorb progress stores negative wait ticks", () => {
  assert.equal(initialAbsorbProgress(), -SEED_ABSORB_WAIT_TICKS);
  assert.ok(isAbsorbWaiting(initialAbsorbProgress()));
  assert.equal(absorbWaitRemaining(initialAbsorbProgress()), SEED_ABSORB_WAIT_TICKS);
  assert.equal(isAbsorbWaiting(1), false);
});

test("absorb wait counts down when no seed arrives", () => {
  const start = initialAbsorbProgress(3);
  assert.equal(nextAbsorbProgress(start, false, 3), -2);
  assert.equal(nextAbsorbProgress(-1, false, 3), 1);
});

test("absorb wait resets when a seed is absorbed", () => {
  assert.equal(nextAbsorbProgress(-1, true, 12), -12);
  assert.equal(nextAbsorbProgress(-5, true, 12), -12);
});

test("more absorbed seeds raise target height", () => {
  const one = nextSeedCountFromPositions(1, 10, []);
  const three = nextSeedCountFromPositions(1, 10, [{ x: 10 }, { x: 11 }]);
  assert.equal(one, 1);
  assert.equal(three, 3);
  assert.equal(targetHeightForSeedCount(three), TRUNK_HEIGHT + 2 * HEIGHT_PER_EXTRA_SEED);
  assert.ok(targetHeightForSeedCount(three) > targetHeightForSeedCount(one));
});

test("absorb seed count stops at the max", () => {
  const seeds = Array.from({ length: 20 }, (_, i) => ({ x: 10 + i }));
  assert.equal(nextSeedCountFromPositions(1, 10, seeds), SEED_COUNT_MAX);
});
