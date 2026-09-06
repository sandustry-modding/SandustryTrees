import assert from "node:assert/strict";
import { test } from "node:test";
import { CANOPY_MIN_TRUNK_HEIGHT } from "./constants.ts";
import { canopyDesiredCells, desiredBranchCells, fillCanopy, isVacantCell } from "./fill.ts";
import { TRUNK_HALF_WIDTH, TRUNK_HEIGHT } from "../oakShoot/constants.ts";

const ROOT_X = 10;
const ROOT_Y = 148;

test("canopyDesiredCells grows the crown toward maturity", () => {
  const young = canopyDesiredCells(ROOT_X, ROOT_Y, CANOPY_MIN_TRUNK_HEIGHT);
  const mature = canopyDesiredCells(ROOT_X, ROOT_Y, CANOPY_MIN_TRUNK_HEIGHT + 32);
  assert.ok(mature.length > young.length);
  const youngHalf = Math.max(...young.map((cell) => Math.abs(cell.x - ROOT_X)));
  const matureHalf = Math.max(...mature.map((cell) => Math.abs(cell.x - ROOT_X)));
  assert.ok(matureHalf > youngHalf);
});

test("canopyDesiredCells widens with height", () => {
  const short = canopyDesiredCells(ROOT_X, ROOT_Y, CANOPY_MIN_TRUNK_HEIGHT);
  const tall = canopyDesiredCells(ROOT_X, ROOT_Y, CANOPY_MIN_TRUNK_HEIGHT + 20);
  const maxHalfShort = Math.max(...short.map((cell) => Math.abs(cell.x - ROOT_X)));
  const maxHalfTall = Math.max(...tall.map((cell) => Math.abs(cell.x - ROOT_X)));
  assert.ok(maxHalfTall > maxHalfShort);
});

test("desiredBranchCells forks stay 4-connected", () => {
  const lines = desiredBranchCells(ROOT_X, ROOT_Y, TRUNK_HEIGHT);
  const keys = new Set(lines.map((cell) => `${cell.x},${cell.y}`));
  const offTrunk = lines.filter((cell) => Math.abs(cell.x - ROOT_X) > TRUNK_HALF_WIDTH);
  assert.ok(offTrunk.length > 0);
  for (const cell of offTrunk) {
    const ortho =
      keys.has(`${cell.x + 1},${cell.y}`) ||
      keys.has(`${cell.x - 1},${cell.y}`) ||
      keys.has(`${cell.x},${cell.y + 1}`) ||
      keys.has(`${cell.x},${cell.y - 1}`);
    assert.ok(ortho, `branch ${cell.x},${cell.y} has no ortho neighbor`);
  }
});

test("desiredBranchCells forks past the trunk", () => {
  const young = desiredBranchCells(ROOT_X, ROOT_Y, 22);
  const mature = desiredBranchCells(ROOT_X, ROOT_Y, TRUNK_HEIGHT);
  assert.ok(young.length > 0);
  assert.ok(mature.length > young.length);
  const matureHalf = Math.max(...mature.map((cell) => Math.abs(cell.x - ROOT_X)));
  assert.ok(matureHalf > TRUNK_HALF_WIDTH);
});

test("desiredBranchCells stay put as the trunk grows", () => {
  let previous = desiredBranchCells(ROOT_X, ROOT_Y, CANOPY_MIN_TRUNK_HEIGHT);
  const union = new Map<number, number>();
  for (let height = CANOPY_MIN_TRUNK_HEIGHT; height <= TRUNK_HEIGHT; height += 1) {
    const cells = desiredBranchCells(ROOT_X, ROOT_Y, height);
    for (const cell of previous) {
      assert.ok(
        cells.some((next) => next.x === cell.x && next.y === cell.y),
        `height ${height} dropped limb cell ${cell.x},${cell.y}`,
      );
    }
    for (const cell of cells) {
      const width = union.get(cell.y) ?? 0;
      union.set(cell.y, Math.max(width, Math.abs(cell.x - ROOT_X)));
    }
    previous = cells;
  }
  const rows = [...union.entries()].sort((a, b) => b[0] - a[0]);
  let grewEveryRow = rows.length > 1;
  for (let i = 1; i < rows.length; i += 1) {
    const lower = rows[i - 1];
    const higher = rows[i];
    if (!lower || !higher) continue;
    if (higher[1] <= lower[1]) grewEveryRow = false;
  }
  assert.equal(grewEveryRow, false, "limb width must not form an upward funnel");
});

test("canopyDesiredCells leaves gaps beside inner limbs", () => {
  const leaves = new Set(
    canopyDesiredCells(ROOT_X, ROOT_Y, TRUNK_HEIGHT).map((cell) => `${cell.x},${cell.y}`),
  );
  const branches = desiredBranchCells(ROOT_X, ROOT_Y, TRUNK_HEIGHT);
  assert.ok(branches.some((cell) => Math.abs(cell.x - ROOT_X) > TRUNK_HALF_WIDTH));
  for (const cell of branches) {
    assert.equal(leaves.has(`${cell.x},${cell.y}`), false);
  }
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
  const occupied = new Set(["10,132", "12,131"]);
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
    { oakLeaf: 2, oakWood: 3 },
    ROOT_X,
    ROOT_Y,
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
  const leaves = new Set<string>();
  const api = {
    grid: {
      isCellEmptyAtCell: (x: number, y: number) => !leaves.has(`${x},${y}`),
      isTerrainAtCell: () => false,
      reportActivityAtCell: () => {},
    },
    terrains: { getTypeAtCell: () => null },
    elements: {
      isTypeAtCell: (x: number, y: number) => leaves.has(`${x},${y}`),
      getTypeAtCell: (x: number, y: number) => (leaves.has(`${x},${y}`) ? 2 : null),
      createAtCell: (x: number, y: number) => {
        const key = `${x},${y}`;
        created.push(key);
        leaves.add(key);
      },
      removeAtCell: (x: number, y: number) => {
        const key = `${x},${y}`;
        removed.push(key);
        leaves.delete(key);
      },
    },
  };
  fillCanopy(
    api as unknown as WorkerSandkitApi,
    { oakLeaf: 2, oakWood: 3 },
    ROOT_X,
    ROOT_Y,
    CANOPY_MIN_TRUNK_HEIGHT,
  );
  const first = created.length;
  assert.ok(first > 0);
  created.length = 0;
  fillCanopy(
    api as unknown as WorkerSandkitApi,
    { oakLeaf: 2, oakWood: 3 },
    ROOT_X,
    ROOT_Y,
    CANOPY_MIN_TRUNK_HEIGHT + 1,
    CANOPY_MIN_TRUNK_HEIGHT,
  );
  assert.ok(created.length > 0);
  assert.ok(created.length < first);
});
