import { CANOPY_TIP_OFFSET_CELLS } from "../canopy/constants.ts";
import { canopyMaxHalfForHalfWidth, canopyRowsForHalfWidth } from "../grow/size.ts";
import { TRUNK_HALF_WIDTH_MAX, TRUNK_HEIGHT_MAX } from "../grow/constants.ts";
import { cellKey } from "../shared/cell.ts";
import { CARDINAL_DIRS } from "../shared/dirs.ts";

/** Vertical span to search for remaining trunk cells after one cell is mined. */
const TRUNK_SEARCH = TRUNK_HEIGHT_MAX + 2;

/** Vertical span to search for canopy needles around a mined trunk cell. */
const CANOPY_SEARCH =
  TRUNK_HEIGHT_MAX + canopyRowsForHalfWidth(TRUNK_HALF_WIDTH_MAX) + CANOPY_TIP_OFFSET_CELLS + 2;

const MAX_CONNECTED = (2 * TRUNK_HALF_WIDTH_MAX + 1) * (TRUNK_HEIGHT_MAX + 4);
const NEEDLE_SEARCH_HALF = canopyMaxHalfForHalfWidth(TRUNK_HALF_WIDTH_MAX);

export type TrunkCollapseOps = {
  isPineWood: (cellX: number, cellY: number) => boolean;
  isNeedle: (cellX: number, cellY: number) => boolean;
  isShoot: (cellX: number, cellY: number) => boolean;
  needleRootX: (cellX: number, cellY: number) => number;
  removeWood: (cellX: number, cellY: number) => void;
  dropRawWood: (cellX: number, cellY: number) => void;
  dropLeafDust: (cellX: number, cellY: number) => void;
  dropPineSeed?: (cellX: number, cellY: number) => void;
  seedSlots?: ReadonlySet<string>;
};

export function collectConnectedTrunkCells(
  isWood: (cellX: number, cellY: number) => boolean,
  startX: number,
  startY: number,
): { x: number; y: number }[] {
  const queue: { x: number; y: number }[] = [];
  if (isWood(startX, startY)) {
    queue.push({ x: startX, y: startY });
  } else {
    for (const [dx, dy] of CARDINAL_DIRS) {
      const cellX = startX + dx;
      const cellY = startY + dy;
      if (isWood(cellX, cellY)) queue.push({ x: cellX, y: cellY });
    }
  }

  const seen = new Set<string>();
  const cells: { x: number; y: number }[] = [];
  while (queue.length > 0 && cells.length < MAX_CONNECTED) {
    const cell = queue.pop();
    if (!cell) break;
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    if (!isWood(cell.x, cell.y)) continue;
    seen.add(key);
    cells.push(cell);
    for (const [dx, dy] of CARDINAL_DIRS) {
      queue.push({ x: cell.x + dx, y: cell.y + dy });
    }
  }
  return cells;
}

/** Convert remaining trunk terrain, the shoot, and linked needles after one trunk cell is mined. */
export function collapseTrunkAround(cellX: number, minedY: number, ops: TrunkCollapseOps): void {
  const connected = collectConnectedTrunkCells(ops.isPineWood, cellX, minedY);
  const columnXs = new Set<number>([cellX]);
  for (const cell of connected) {
    columnXs.add(cell.x);
    if (cell.x === cellX && cell.y === minedY) continue;
    ops.removeWood(cell.x, cell.y);
    ops.dropRawWood(cell.x, cell.y);
  }

  const top = minedY - CANOPY_SEARCH;
  const bottom = minedY + TRUNK_SEARCH;
  for (const columnX of columnXs) {
    for (let cellY = top; cellY <= bottom; cellY += 1) {
      if (ops.isShoot(columnX, cellY)) {
        ops.dropRawWood(columnX, cellY);
      }
    }
  }

  const left = Math.min(...columnXs) - NEEDLE_SEARCH_HALF;
  const right = Math.max(...columnXs) + NEEDLE_SEARCH_HALF;
  for (let needleX = left; needleX <= right; needleX += 1) {
    for (let needleY = top; needleY <= bottom; needleY += 1) {
      if (!ops.isNeedle(needleX, needleY)) continue;
      if (!columnXs.has(ops.needleRootX(needleX, needleY))) continue;
      const key = cellKey(needleX, needleY);
      if (ops.seedSlots?.has(key) && ops.dropPineSeed) {
        ops.dropPineSeed(needleX, needleY);
        continue;
      }
      ops.dropLeafDust(needleX, needleY);
    }
  }
}
