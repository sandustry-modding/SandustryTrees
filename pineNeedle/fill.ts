import type { Cell } from "../shared/cell.ts";
import { TRUNK_HALF_WIDTH, TRUNK_HEIGHT } from "../pineShoot/constants.ts";
import { CANOPY_LEAD, CANOPY_MAX_HALF, CANOPY_MIN_TRUNK_HEIGHT } from "./constants.ts";

export type CanopyTypes = {
  pineNeedle: number;
  pineWood: number;
};

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}

/** Needle cells for the canopy at this trunk height. */
export function canopyDesiredCells(
  rootX: number,
  woodY: number,
  height: number,
): Cell[] {
  if (height < CANOPY_MIN_TRUNK_HEIGHT) return [];
  const growing = height < TRUNK_HEIGHT;
  const peakY = growing ? woodY - 1 : woodY;
  const tipY = peakY - CANOPY_LEAD;
  const rows = CANOPY_LEAD + 1 + (height - CANOPY_MIN_TRUNK_HEIGHT);
  const growSpan = Math.max(1, TRUNK_HEIGHT - CANOPY_MIN_TRUNK_HEIGHT);
  const growT = Math.min(1, (height - CANOPY_MIN_TRUNK_HEIGHT) / growSpan);
  const maxHalf =
    TRUNK_HALF_WIDTH + 1 + Math.round(growT * (CANOPY_MAX_HALF - TRUNK_HALF_WIDTH - 1));
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    const cellY = tipY + row;
    const t = rows <= 1 ? 1 : row / (rows - 1);
    const half = TRUNK_HALF_WIDTH + 1 + Math.round(t * (maxHalf - TRUNK_HALF_WIDTH - 1));
    for (let dx = -half; dx <= half; dx += 1) {
      if (growing && cellY === peakY && dx === 0) continue;
      cells.push({ x: rootX + dx, y: cellY });
    }
  }
  return cells;
}

export function fillCanopy(
  api: WorkerSandkitApi,
  types: CanopyTypes,
  rootX: number,
  woodY: number,
  height: number,
): void {
  if (height < CANOPY_MIN_TRUNK_HEIGHT) return;
  const growing = height < TRUNK_HEIGHT;
  const peakY = growing ? woodY - 1 : woodY;
  const tipY = peakY - CANOPY_LEAD;
  const rows = CANOPY_LEAD + 1 + (height - CANOPY_MIN_TRUNK_HEIGHT);
  const desired = canopyDesiredCells(rootX, woodY, height);
  const desiredKeys = new Set(desired.map(cellKey));
  const clearTop = tipY - 1;
  const clearBottom = woodY + rows;
  for (let cellY = clearTop; cellY <= clearBottom; cellY += 1) {
    for (let dx = -CANOPY_MAX_HALF; dx <= CANOPY_MAX_HALF; dx += 1) {
      const cellX = rootX + dx;
      if (!api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle)) continue;
      if (desiredKeys.has(`${cellX},${cellY}`)) continue;
      api.elements.removeAtCell(cellX, cellY);
    }
  }
  for (const cell of desired) {
    if (api.terrains.getTypeAtCell(cell.x, cell.y) === types.pineWood) continue;
    if (!api.grid.isCellEmptyAtCell(cell.x, cell.y)) continue;
    api.elements.createAtCell(cell.x, cell.y, types.pineNeedle);
    api.grid.reportActivityAtCell(cell.x, cell.y);
  }
}
