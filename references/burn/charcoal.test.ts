import assert from "node:assert/strict";
import { test } from "node:test";
import { pickSpreadNeighbor } from "./charcoal.ts";

test("pickSpreadNeighbor returns null when no raw wood neighbors", () => {
  const next = pickSpreadNeighbor(
    () => false,
    () => false,
    5,
    5,
    0,
  );
  assert.equal(next, null);
});

test("pickSpreadNeighbor skips already primed neighbors", () => {
  const raw = new Set(["5,4", "6,5"]);
  const primed = new Set(["5,4"]);
  const next = pickSpreadNeighbor(
    (x, y) => raw.has(`${x},${y}`),
    (x, y) => primed.has(`${x},${y}`),
    5,
    5,
    0,
  );
  assert.deepEqual(next, { x: 6, y: 5 });
});

test("pickSpreadNeighbor uses the roll to pick among candidates", () => {
  const raw = new Set(["5,4", "6,5", "5,6", "4,5"]);
  const first = pickSpreadNeighbor(
    (x, y) => raw.has(`${x},${y}`),
    () => false,
    5,
    5,
    0,
  );
  const last = pickSpreadNeighbor(
    (x, y) => raw.has(`${x},${y}`),
    () => false,
    5,
    5,
    0.99,
  );
  assert.ok(first);
  assert.ok(last);
  assert.notDeepEqual(first, last);
});
