import assert from "node:assert/strict";
import { test } from "node:test";
import { pickCanopyConeCells, shouldSpawnSecondCone } from "./spawn.ts";

test("shouldSpawnSecondCone uses the roll against chance", () => {
  assert.equal(shouldSpawnSecondCone(0, 0.01), true);
  assert.equal(shouldSpawnSecondCone(0.009, 0.01), true);
  assert.equal(shouldSpawnSecondCone(0.01, 0.01), false);
});

test("pickCanopyConeCells always picks one needle", () => {
  const needles = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ];
  assert.deepEqual(pickCanopyConeCells(needles, 0, false, 0), [{ x: 1, y: 1 }]);
  assert.deepEqual(pickCanopyConeCells(needles, 0.99, false, 0), [{ x: 3, y: 1 }]);
  assert.deepEqual(pickCanopyConeCells([], 0, true, 0), []);
});

test("pickCanopyConeCells picks a second distinct needle", () => {
  const needles = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ];
  assert.deepEqual(pickCanopyConeCells(needles, 0, true, 0), [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ]);
  assert.deepEqual(pickCanopyConeCells([{ x: 4, y: 4 }], 0, true, 0), [{ x: 4, y: 4 }]);
});
