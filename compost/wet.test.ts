import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canPowderMove,
  findAdjacentWater,
  isSettled,
  isSupported,
  nextDirtWait,
  nextIdleTicks,
  shouldSettleTicks,
} from "./wet.ts";

test("findAdjacentWater returns the first cardinal water cell", () => {
  const water = new Set(["6,5"]);
  assert.deepEqual(
    findAdjacentWater((x, y) => water.has(`${x},${y}`), 5, 5),
    { x: 6, y: 5 },
  );
});

test("findAdjacentWater returns null when no water touches the cell", () => {
  assert.equal(
    findAdjacentWater(() => false, 5, 5),
    null,
  );
});

test("isSupported is false when the cell below is empty", () => {
  assert.equal(
    isSupported((x, y) => x === 5 && y === 6, 5, 5),
    false,
  );
});

test("isSupported is true when the cell below is occupied", () => {
  assert.equal(
    isSupported(() => false, 5, 5),
    true,
  );
});

test("nextIdleTicks resets when not settled", () => {
  assert.equal(nextIdleTicks(12, false), 0);
});

test("nextIdleTicks counts up when settled", () => {
  assert.equal(nextIdleTicks(12, true), 13);
});

test("canPowderMove is true when the cell below is empty", () => {
  assert.equal(
    canPowderMove((x, y) => x === 5 && y === 6, 5, 5),
    true,
  );
});

test("canPowderMove is true when a diagonal slide is open", () => {
  const empty = new Set(["4,5", "4,6"]);
  assert.equal(
    canPowderMove((x, y) => empty.has(`${x},${y}`), 5, 5),
    true,
  );
});

test("isSettled is false when the cell can still slide", () => {
  const empty = new Set(["6,5", "6,6"]);
  assert.equal(
    isSettled((x, y) => empty.has(`${x},${y}`), 5, 5),
    false,
  );
});

test("isSettled is true when fall and slide are blocked", () => {
  const empty = new Set(["4,5", "6,5"]);
  assert.equal(
    isSettled((x, y) => empty.has(`${x},${y}`), 5, 5),
    true,
  );
});

test("shouldSettleTicks is true at the wait", () => {
  assert.equal(shouldSettleTicks(60, 60), true);
  assert.equal(shouldSettleTicks(59, 60), false);
});

test("nextDirtWait does not roll before the min idle", () => {
  assert.equal(nextDirtWait(0, true, 179, 180, 90), 0);
});

test("nextDirtWait rolls when idle long enough and no wait is stored", () => {
  assert.equal(nextDirtWait(0, true, 180, 180, 90), 90);
});

test("nextDirtWait keeps the rolled wait while idle", () => {
  assert.equal(nextDirtWait(90, true, 181, 180, 48), 90);
});

test("nextDirtWait clears the wait when the cell moves", () => {
  assert.equal(nextDirtWait(90, false, 181, 180, 48), 0);
});
