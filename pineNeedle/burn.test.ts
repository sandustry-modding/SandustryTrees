import assert from "node:assert/strict";
import { test } from "node:test";
import { pickNeedleNeighbor, shouldIgnite, touchesFire } from "./burn.ts";

test("touchesFire is true for an ortho-8 fire neighbor", () => {
  const fire = new Set(["6,5"]);
  assert.equal(
    touchesFire((x, y) => fire.has(`${x},${y}`), 5, 5),
    true,
  );
  assert.equal(
    touchesFire((x, y) => fire.has(`${x},${y}`), 8, 8),
    false,
  );
});

test("shouldIgnite uses the roll against chance", () => {
  assert.equal(shouldIgnite(0, 0.03), true);
  assert.equal(shouldIgnite(0.029, 0.03), true);
  assert.equal(shouldIgnite(0.03, 0.03), false);
  assert.equal(shouldIgnite(0.9, 0.03), false);
});

test("pickNeedleNeighbor returns one needle neighbor", () => {
  const needles = new Set(["6,5", "4,5"]);
  const isNeedle = (x: number, y: number) => needles.has(`${x},${y}`);
  const first = pickNeedleNeighbor(isNeedle, 5, 5, 0);
  const last = pickNeedleNeighbor(isNeedle, 5, 5, 0.99);
  assert.deepEqual(first, { x: 6, y: 5 });
  assert.deepEqual(last, { x: 4, y: 5 });
  assert.equal(pickNeedleNeighbor(isNeedle, 8, 8, 0), null);
});
