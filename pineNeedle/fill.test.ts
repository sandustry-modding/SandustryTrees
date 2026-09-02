import assert from "node:assert/strict";
import { test } from "node:test";
import { CANOPY_MIN_TRUNK_HEIGHT } from "./constants.ts";
import { canopyDesiredCells, fillCanopy, isVacantCell } from "./fill.ts";

function cellSet(cells: { x: number; y: number }[]): Set<string> {
  return new Set(cells.map((cell) => `${cell.x},${cell.y}`));
}

test("canopyDesiredCells keeps side needles when the trunk grows", () => {
  const rootX = 10;
  const woodY = 100;
  const shorter = canopyDesiredCells(rootX, woodY, CANOPY_MIN_TRUNK_HEIGHT);
  const taller = canopyDesiredCells(rootX, woodY - 1, CANOPY_MIN_TRUNK_HEIGHT + 1);
  const prior = cellSet(shorter);
  const next = cellSet(taller);
  for (const key of prior) {
    const [x] = key.split(",").map(Number);
    if (x === rootX) continue;
    assert.ok(next.has(key), `lost needle cell ${key}`);
  }
  assert.ok(taller.length > shorter.length);
});

test("canopyDesiredCells widens with height", () => {
  const rootX = 10;
  const woodY = 100;
  const short = canopyDesiredCells(rootX, woodY, CANOPY_MIN_TRUNK_HEIGHT);
  const tall = canopyDesiredCells(rootX, woodY - 40, CANOPY_MIN_TRUNK_HEIGHT + 40);
  const maxHalfShort = Math.max(...short.map((cell) => Math.abs(cell.x - rootX)));
  const maxHalfTall = Math.max(...tall.map((cell) => Math.abs(cell.x - rootX)));
  assert.ok(maxHalfTall > maxHalfShort);
});

test("isVacantCell is false for terrain or an element", () => {
  const empty = {
    grid: { isCellEmptyAtCell: () => true, isTerrainAtCell: () => false },
    elements: { getTypeAtCell: () => null },
  };
  assert.equal(isVacantCell(empty, 0, 0), true);
  assert.equal(
    isVacantCell(
      {
        grid: { isCellEmptyAtCell: () => false, isTerrainAtCell: () => true },
        elements: { getTypeAtCell: () => null },
      },
      0,
      0,
    ),
    false,
  );
  assert.equal(
    isVacantCell(
      {
        grid: { isCellEmptyAtCell: () => true, isTerrainAtCell: () => false },
        elements: { getTypeAtCell: () => 7 },
      },
      0,
      0,
    ),
    false,
  );
});

test("fillCanopy does not write occupied cells", () => {
  const occupied = new Set(["10,68", "12,67"]);
  const created: string[] = [];
  const api = {
    grid: {
      isCellEmptyAtCell: (x: number, y: number) => !occupied.has(`${x},${y}`),
      isTerrainAtCell: (x: number, y: number) => occupied.has(`${x},${y}`),
      reportActivityAtCell: () => {},
    },
    terrains: { getTypeAtCell: () => null },
    elements: {
      isTypeAtCell: () => false,
      getTypeAtCell: (x: number, y: number) => (occupied.has(`${x},${y}`) ? 1 : null),
      createAtCell: (x: number, y: number) => {
        created.push(`${x},${y}`);
      },
      removeAtCell: () => {},
    },
  };
  fillCanopy(
    api as unknown as WorkerSandkitApi,
    { pineNeedle: 2, pineWood: 3 },
    10,
    70,
    CANOPY_MIN_TRUNK_HEIGHT,
  );
  for (const key of created) {
    assert.equal(occupied.has(key), false, `replaced occupied cell ${key}`);
  }
  assert.ok(created.length > 0);
});

test("fillCanopy only writes cells that are new since previousHeight", () => {
  const created: string[] = [];
  const removed: string[] = [];
  const needles = new Set<string>();
  const api = {
    grid: {
      isCellEmptyAtCell: (x: number, y: number) => !needles.has(`${x},${y}`),
      isTerrainAtCell: () => false,
      reportActivityAtCell: () => {},
    },
    terrains: { getTypeAtCell: () => null },
    elements: {
      isTypeAtCell: (x: number, y: number) => needles.has(`${x},${y}`),
      getTypeAtCell: (x: number, y: number) => (needles.has(`${x},${y}`) ? 2 : null),
      createAtCell: (x: number, y: number) => {
        const key = `${x},${y}`;
        created.push(key);
        needles.add(key);
      },
      removeAtCell: (x: number, y: number) => {
        const key = `${x},${y}`;
        removed.push(key);
        needles.delete(key);
      },
    },
  };
  const rootX = 10;
  fillCanopy(
    api as unknown as WorkerSandkitApi,
    { pineNeedle: 2, pineWood: 3 },
    rootX,
    70,
    CANOPY_MIN_TRUNK_HEIGHT,
  );
  const first = created.length;
  assert.ok(first > 0);
  created.length = 0;
  fillCanopy(
    api as unknown as WorkerSandkitApi,
    { pineNeedle: 2, pineWood: 3 },
    rootX,
    69,
    CANOPY_MIN_TRUNK_HEIGHT + 1,
    CANOPY_MIN_TRUNK_HEIGHT,
  );
  assert.ok(created.length > 0);
  assert.ok(created.length < first);
});
