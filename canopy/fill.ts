import { TRUNK_HALF_WIDTH, TRUNK_HEIGHT } from "../grow/constants.ts";
import { CANOPY_LEAD, CANOPY_MAX_HALF, CANOPY_MIN_TRUNK_HEIGHT } from "./constants.ts";

export type CanopyTypes = {
  pineNeedle: number;
  pineWood: number;
};

export function fillCanopy(
  api: WorkerSandkitApi,
  types: CanopyTypes,
  rootX: number,
  woodY: number,
  height: number
): void {
  if (height < CANOPY_MIN_TRUNK_HEIGHT) return;
  const shootY = woodY - 1;
  const tipY = shootY - CANOPY_LEAD;
  const rows = CANOPY_LEAD + (height - CANOPY_MIN_TRUNK_HEIGHT);
  const growSpan = Math.max(1, TRUNK_HEIGHT - CANOPY_MIN_TRUNK_HEIGHT);
  const growT = Math.min(1, (height - CANOPY_MIN_TRUNK_HEIGHT) / growSpan);
  const maxHalf =
    TRUNK_HALF_WIDTH + 1 + Math.round(growT * (CANOPY_MAX_HALF - TRUNK_HALF_WIDTH - 1));
  const clearTop = tipY - 1;
  const clearBottom = woodY + rows;
  for (let cellY = clearTop; cellY <= clearBottom; cellY += 1) {
    for (let dx = -CANOPY_MAX_HALF; dx <= CANOPY_MAX_HALF; dx += 1) {
      const cellX = rootX + dx;
      if (!api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle)) continue;
      api.elements.removeAtCell(cellX, cellY);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    const cellY = tipY + row;
    const t = rows <= 1 ? 1 : row / (rows - 1);
    const half = TRUNK_HALF_WIDTH + 1 + Math.round(t * (maxHalf - TRUNK_HALF_WIDTH - 1));
    for (let dx = -half; dx <= half; dx += 1) {
      if (cellY >= shootY && Math.abs(dx) <= TRUNK_HALF_WIDTH) continue;
      const cellX = rootX + dx;
      if (!api.grid.isCellEmptyAtCell(cellX, cellY)) continue;
      api.elements.createAtCell(cellX, cellY, types.pineNeedle);
      api.grid.reportActivityAtCell(cellX, cellY);
    }
  }
}
