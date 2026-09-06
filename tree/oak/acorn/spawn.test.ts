import assert from "node:assert/strict";
import { test } from "node:test";
import { pickCanopyAcornCells, shouldSpawnSecondAcorn } from "./spawn.ts";

test("shouldSpawnSecondAcorn uses the roll against chance", () => {
  assert.equal(shouldSpawnSecondAcorn(0, 0.01), true);
  assert.equal(shouldSpawnSecondAcorn(0.009, 0.01), true);
  assert.equal(shouldSpawnSecondAcorn(0.01, 0.01), false);
});

test("pickCanopyAcornCells always picks one leaf", () => {
  const leaves = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ];
  assert.deepEqual(pickCanopyAcornCells(leaves, 0, false, 0), [{ x: 1, y: 1 }]);
  assert.deepEqual(pickCanopyAcornCells(leaves, 0.99, false, 0), [{ x: 3, y: 1 }]);
  assert.deepEqual(pickCanopyAcornCells([], 0, true, 0), []);
});

test("pickCanopyAcornCells picks a second distinct leaf", () => {
  const leaves = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ];
  assert.deepEqual(pickCanopyAcornCells(leaves, 0, true, 0), [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ]);
  assert.deepEqual(pickCanopyAcornCells([{ x: 4, y: 4 }], 0, true, 0), [{ x: 4, y: 4 }]);
});
