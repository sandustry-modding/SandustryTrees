import assert from "node:assert/strict";
import { test } from "node:test";
import { trunkMidHalf, trunkRowHalfWidth } from "./trunkWidth.ts";

test("trunkMidHalf starts at 0 and reaches the mature half-width", () => {
  assert.equal(trunkMidHalf(1, 48, 2), 0);
  assert.equal(trunkMidHalf(24, 48, 2), 1);
  assert.equal(trunkMidHalf(48, 48, 2), 2);
  assert.equal(trunkMidHalf(1, 72, 1), 0);
  assert.equal(trunkMidHalf(72, 72, 1), 1);
});

test("trunkRowHalfWidth keeps the current tip 1-wide", () => {
  const half = trunkRowHalfWidth({
    dyFromRoot: 11,
    placedHeight: 12,
    heightMax: 48,
    midHalfMax: 2,
    extraHalf: 0,
    flareRows: 6,
    taperRows: 6,
  });
  assert.equal(half, 0);
});

test("trunkRowHalfWidth thickens older rows toward mid width", () => {
  const tip = trunkRowHalfWidth({
    dyFromRoot: 35,
    placedHeight: 36,
    heightMax: 48,
    midHalfMax: 2,
    extraHalf: 0,
    flareRows: 6,
    taperRows: 6,
  });
  const bole = trunkRowHalfWidth({
    dyFromRoot: 10,
    placedHeight: 36,
    heightMax: 48,
    midHalfMax: 2,
    extraHalf: 0,
    flareRows: 6,
    taperRows: 6,
  });
  assert.equal(tip, 0);
  assert.equal(bole, 2);
});
