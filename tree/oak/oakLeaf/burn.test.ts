import assert from "node:assert/strict";
import { test } from "node:test";
import { pickLeafNeighbor, shouldIgnite, touchesFire } from "./burn.ts";

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

test("pickLeafNeighbor returns one oak leaf neighbor", () => {
  const leaves = new Set(["6,5", "4,5"]);
  const isLeaf = (x: number, y: number) => leaves.has(`${x},${y}`);
  const first = pickLeafNeighbor(isLeaf, 5, 5, 0);
  const last = pickLeafNeighbor(isLeaf, 5, 5, 0.99);
  assert.deepEqual(first, { x: 6, y: 5 });
  assert.deepEqual(last, { x: 4, y: 5 });
  assert.equal(pickLeafNeighbor(isLeaf, 8, 8, 0), null);
});
