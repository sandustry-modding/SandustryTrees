import assert from "node:assert/strict";
import { test } from "node:test";
import { TRUNK_HALF_WIDTH, TRUNK_HEIGHT } from "../grow/constants.ts";
import {
  CANOPY_MAX_HALF_WIDTH,
  CANOPY_MIN_TRUNK_HEIGHT,
  CANOPY_ROWS,
  CANOPY_TIP_OFFSET_CELLS,
} from "./constants.ts";
import {
  canopyCellsForHeight,
  canopyHalfWidth,
  canopyKeepCells,
  canopyMaxHalfForHeight,
  canopyNewCells,
  canopyRowCells,
  canopyRowsForHeight,
  canopyTipY,
  canopyTreeTopY,
} from "./shape.ts";

test("canopyHalfWidth is 1 at the treetop", () => {
  assert.equal(canopyHalfWidth(0, CANOPY_ROWS, CANOPY_MAX_HALF_WIDTH), 1);
});

test("canopyHalfWidth is max at the bottom of the canopy", () => {
  assert.equal(
    canopyHalfWidth(CANOPY_ROWS - 1, CANOPY_ROWS, CANOPY_MAX_HALF_WIDTH),
    CANOPY_MAX_HALF_WIDTH,
  );
});

test("canopyHalfWidth stays inside 1–max", () => {
  for (let row = 0; row < CANOPY_ROWS; row += 1) {
    const width = canopyHalfWidth(row, CANOPY_ROWS, CANOPY_MAX_HALF_WIDTH);
    assert.ok(width >= 1 && width <= CANOPY_MAX_HALF_WIDTH, `row ${row} width ${width}`);
  }
});

test("canopyRowCells skips the trunk columns", () => {
  const cells = canopyRowCells(10, 100, CANOPY_ROWS - 1);
  assert.ok(cells.length > 0);
  const trunkTopY = canopyTreeTopY(100);
  for (const cell of cells) {
    if (cell.y >= trunkTopY) {
      assert.ok(Math.abs(cell.x - 10) > TRUNK_HALF_WIDTH);
    }
  }
  assert.equal(Math.max(...cells.map((cell) => Math.abs(cell.x - 10))), CANOPY_MAX_HALF_WIDTH);
});

test("the needle cone starts above the top trunk row", () => {
  const rootY = 100;
  const tipY = canopyTipY(rootY);
  const trunkTopY = canopyTreeTopY(rootY);
  assert.equal(trunkTopY - tipY, CANOPY_TIP_OFFSET_CELLS);
  assert.ok(tipY < trunkTopY);
  const firstRow = canopyRowCells(10, rootY, 0);
  assert.ok(firstRow.some((cell) => cell.x === 10));
  for (const cell of firstRow) {
    assert.equal(cell.y, tipY + 1);
    assert.ok(cell.y < trunkTopY);
  }
});

test("full height matches the mature cone size", () => {
  assert.equal(canopyRowsForHeight(TRUNK_HEIGHT), CANOPY_ROWS);
  assert.equal(canopyMaxHalfForHeight(TRUNK_HEIGHT), CANOPY_MAX_HALF_WIDTH);
  const cells = canopyCellsForHeight(10, 100, TRUNK_HEIGHT);
  assert.equal(Math.max(...cells.map((cell) => Math.abs(cell.x - 10))), CANOPY_MAX_HALF_WIDTH);
});

test("a short sapling uses fewer rows and a smaller width", () => {
  const height = 8;
  const rows = canopyRowsForHeight(height);
  const maxHalf = canopyMaxHalfForHeight(height);
  assert.ok(rows < CANOPY_ROWS);
  assert.ok(maxHalf < CANOPY_MAX_HALF_WIDTH);
  assert.ok(rows >= 1);
  assert.ok(maxHalf >= 1);
  const cells = canopyCellsForHeight(10, 100, height);
  assert.ok(cells.length > 0);
  assert.ok(Math.max(...cells.map((cell) => Math.abs(cell.x - 10))) <= maxHalf);
  const topY = canopyTreeTopY(100, height);
  for (const cell of cells) {
    if (cell.y >= topY) {
      assert.ok(Math.abs(cell.x - 10) > TRUNK_HALF_WIDTH);
    }
    assert.ok(cell.y < 100);
  }
});

test("a wider trunk uses a wider needle cone", () => {
  const widerHalf = TRUNK_HALF_WIDTH + 1;
  const wide = canopyMaxHalfForHeight(TRUNK_HEIGHT, TRUNK_HEIGHT, widerHalf);
  assert.ok(wide > CANOPY_MAX_HALF_WIDTH);
  const cells = canopyRowCells(10, 100, CANOPY_ROWS - 1, TRUNK_HEIGHT, TRUNK_HEIGHT, widerHalf);
  for (const cell of cells) {
    const trunkTopY = canopyTreeTopY(100);
    if (cell.y >= trunkTopY) {
      assert.ok(Math.abs(cell.x - 10) > widerHalf);
    }
  }
});

test("needles do not spawn until the trunk has a stem", () => {
  assert.equal(canopyKeepCells(10, 100, CANOPY_MIN_TRUNK_HEIGHT - 1).length, 0);
  const keep = canopyKeepCells(10, 100, CANOPY_MIN_TRUNK_HEIGHT);
  assert.ok(keep.length > 0);
  for (const cell of keep) {
    assert.ok(100 - cell.y >= 8, `needle at y=${cell.y} is too close to the root`);
  }
});

test("canopyNewCells is empty when the trunk does not grow", () => {
  const height = CANOPY_MIN_TRUNK_HEIGHT + 4;
  assert.equal(canopyNewCells(10, 100, height, height).length, 0);
});

test("canopyNewCells only adds cells that were not in the previous cone", () => {
  const previous = CANOPY_MIN_TRUNK_HEIGHT;
  const height = previous + 1;
  const prevKeys = new Set(canopyKeepCells(10, 100, previous).map((cell) => `${cell.x},${cell.y}`));
  const added = canopyNewCells(10, 100, height, previous);
  assert.ok(added.length > 0);
  for (const cell of added) {
    assert.equal(prevKeys.has(`${cell.x},${cell.y}`), false);
  }
});
