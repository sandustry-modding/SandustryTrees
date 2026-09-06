import { config } from "../../../config.ts";
import type { Cell } from "../../../shared/cell.ts";

export type CanopyTypes = {
  pineNeedle: number;
  pineWood: number;
};

type NeedleGrid = {
  grid: {
    isCellEmptyAtCell(cellX: number, cellY: number): boolean;
    isTerrainAtCell(cellX: number, cellY: number): boolean;
  };
  elements: {
    getTypeAtCell(cellX: number, cellY: number): number | null;
  };
};

/** True when the cell has no terrain and no element. */
export function isVacantCell(api: NeedleGrid, cellX: number, cellY: number): boolean {
  if (api.grid.isTerrainAtCell(cellX, cellY)) return false;
  if (api.elements.getTypeAtCell(cellX, cellY) != null) return false;
  return api.grid.isCellEmptyAtCell(cellX, cellY);
}

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}

/** Needle cells for the canopy at this trunk height. */
export function canopyDesiredCells(rootX: number, woodY: number, height: number): Cell[] {
  if (height < config.pineCanopyMinTrunkHeight) return [];
  const growing = height < config.pineTrunkHeight;
  const peakY = growing ? woodY - 1 : woodY;
  const tipY = peakY - config.pineCanopyLead;
  const rows = config.pineCanopyLead + 1 + (height - config.pineCanopyMinTrunkHeight);
  const growSpan = Math.max(1, config.pineTrunkHeight - config.pineCanopyMinTrunkHeight);
  const growT = Math.min(1, (height - config.pineCanopyMinTrunkHeight) / growSpan);
  const maxHalf =
    config.pineTrunkHalfWidth +
    1 +
    Math.round(growT * (config.pineCanopyMaxHalf - config.pineTrunkHalfWidth - 1));
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    const cellY = tipY + row;
    const t = rows <= 1 ? 1 : row / (rows - 1);
    const half =
      config.pineTrunkHalfWidth + 1 + Math.round(t * (maxHalf - config.pineTrunkHalfWidth - 1));
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
  previousHeight = 0,
): void {
  if (height < config.pineCanopyMinTrunkHeight) return;
  const desired = canopyDesiredCells(rootX, woodY, height);
  const previousWoodY = woodY + Math.max(0, height - previousHeight);
  const previous =
    previousHeight > 0 && previousHeight < height
      ? canopyDesiredCells(rootX, previousWoodY, previousHeight)
      : [];
  const desiredKeys = new Set(desired.map(cellKey));
  const previousKeys = new Set(previous.map(cellKey));
  for (const cell of previous) {
    if (desiredKeys.has(cellKey(cell))) continue;
    if (!api.elements.isTypeAtCell(cell.x, cell.y, types.pineNeedle)) continue;
    api.elements.removeAtCell(cell.x, cell.y);
  }
  for (const cell of desired) {
    if (previousKeys.has(cellKey(cell))) continue;
    if (!isVacantCell(api, cell.x, cell.y)) continue;
    api.elements.createAtCell(cell.x, cell.y, types.pineNeedle);
  }
}
