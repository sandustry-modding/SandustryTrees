import {
  CANOPY_MIN_TRUNK_HEIGHT,
  CANOPY_TIP_OFFSET_CELLS,
} from "./constants.ts";
import { TRUNK_HALF_WIDTH, TRUNK_HEIGHT, TRUNK_HEIGHT_MAX } from "../grow/constants.ts";
import {
  canopyMaxHalfForHalfWidth,
  canopyRowsForHalfWidth,
  storedHalfWidth,
  targetHeightForHalfWidth,
} from "../grow/size.ts";
import { cellKey } from "../shared/cell.ts";

function clampHeight(height: number, targetHeight: number): number {
  const cap = Math.min(Math.max(targetHeight, 1), TRUNK_HEIGHT_MAX);
  if (height < 1) return 1;
  if (height > cap) return cap;
  return height;
}

function scaleCount(max: number, height: number): number {
  const grown = clampHeight(height, TRUNK_HEIGHT);
  return Math.max(1, Math.round((max * grown) / TRUNK_HEIGHT));
}

export function canopyRowsForHeight(
  height: number,
  _targetHeight = TRUNK_HEIGHT,
  halfWidth = TRUNK_HALF_WIDTH,
): number {
  return scaleCount(canopyRowsForHalfWidth(halfWidth), height);
}

export function canopyMaxHalfForHeight(
  height: number,
  _targetHeight = TRUNK_HEIGHT,
  halfWidth = TRUNK_HALF_WIDTH,
): number {
  return scaleCount(canopyMaxHalfForHalfWidth(halfWidth), height);
}

/** Needles on each side of the trunk. Row 0 is just below the tip (narrow). */
export function canopyHalfWidth(rowFromTop: number, rows: number, maxHalf: number): number {
  if (rowFromTop <= 0) return 1;
  if (rows <= 1) return maxHalf;
  const t = Math.min(rowFromTop, rows - 1) / (rows - 1);
  return 1 + Math.round(t * (maxHalf - 1));
}

export function canopyTreeTopY(rootY: number, height = TRUNK_HEIGHT): number {
  return rootY - (clampHeight(height, TRUNK_HEIGHT_MAX) - 1);
}

/** Center needle above the top trunk row. */
export function canopyTipY(rootY: number, height = TRUNK_HEIGHT): number {
  return canopyTreeTopY(rootY, height) - CANOPY_TIP_OFFSET_CELLS;
}

/** Needle cells for one canopy row. Skips trunk columns. The cone fills above the wood. */
export function canopyRowCells(
  rootX: number,
  rootY: number,
  rowFromTop: number,
  height = TRUNK_HEIGHT,
  targetHeight = TRUNK_HEIGHT,
  halfWidth = TRUNK_HALF_WIDTH,
): { x: number; y: number }[] {
  const trunkHalf = storedHalfWidth(halfWidth);
  const rows = canopyRowsForHeight(height, targetHeight, trunkHalf);
  if (rowFromTop < 0 || rowFromTop >= rows) return [];
  const cellY = canopyTipY(rootY, height) + 1 + rowFromTop;
  if (cellY >= rootY) return [];
  const half = canopyHalfWidth(
    rowFromTop,
    rows,
    canopyMaxHalfForHeight(height, TRUNK_HEIGHT, trunkHalf),
  );
  const onTrunk = cellY >= canopyTreeTopY(rootY, height);
  const cells: { x: number; y: number }[] = [];
  for (let dx = -half; dx <= half; dx += 1) {
    if (onTrunk && Math.abs(dx) <= trunkHalf) continue;
    cells.push({ x: rootX + dx, y: cellY });
  }
  return cells;
}

export function canopyCellsForHeight(
  rootX: number,
  rootY: number,
  height: number,
  targetHeight = TRUNK_HEIGHT,
  halfWidth = TRUNK_HALF_WIDTH,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const rows = canopyRowsForHeight(height, targetHeight, halfWidth);
  for (let row = 0; row < rows; row += 1) {
    cells.push(...canopyRowCells(rootX, rootY, row, height, targetHeight, halfWidth));
  }
  return cells;
}

/** Needle cells to keep for this height, including the tip. Empty until the trunk is tall enough. */
export function canopyKeepCells(
  rootX: number,
  rootY: number,
  height: number,
  targetHeight = TRUNK_HEIGHT,
  halfWidth = TRUNK_HALF_WIDTH,
): { x: number; y: number }[] {
  if (height < CANOPY_MIN_TRUNK_HEIGHT) return [];
  return [
    { x: rootX, y: canopyTipY(rootY, height) },
    ...canopyCellsForHeight(rootX, rootY, height, targetHeight, halfWidth),
  ];
}

/** Needle cells that appear only because the trunk grew. Does not refill cleared cells. */
export function canopyNewCells(
  rootX: number,
  rootY: number,
  height: number,
  previousHeight: number,
  targetHeight = TRUNK_HEIGHT,
  halfWidth = TRUNK_HALF_WIDTH,
  previousHalfWidth = halfWidth,
): { x: number; y: number }[] {
  if (height <= previousHeight && halfWidth <= previousHalfWidth) return [];
  const keep = canopyKeepCells(rootX, rootY, height, targetHeight, halfWidth);
  const previous = new Set(
    canopyKeepCells(
      rootX,
      rootY,
      previousHeight,
      targetHeightForHalfWidth(previousHalfWidth),
      previousHalfWidth,
    ).map((cell) => cellKey(cell.x, cell.y)),
  );
  return keep.filter((cell) => !previous.has(cellKey(cell.x, cell.y)));
}

export function canopySearchHalf(halfWidth: number): number {
  return canopyMaxHalfForHalfWidth(halfWidth);
}
