import { fillCanopy } from "../canopy/fill.ts";
import { GROW_DURATION_TICKS, TRUNK_HALF_WIDTH, TRUNK_HEIGHT } from "./constants.ts";

export type GrowTypes = {
  pineShoot: number;
  pineWood: number;
  pineNeedle: number;
};

export function growPineShoot(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.pineShoot)) return;
  const height = api.elements.getDataFieldAtCell(cellX, cellY, 1) ?? 0;
  const aboveY = cellY - 1;
  api.elements.removeAtCell(cellX, cellY);
  // Trunk thickness based on tree size and number of seed absorbed
  for (let dx = -TRUNK_HALF_WIDTH; dx <= TRUNK_HALF_WIDTH; dx += 1) {
    const woodX = cellX + dx;
    if (!api.grid.isCellEmptyAtCell(woodX, cellY)) continue;
    api.terrains.createAtCell(woodX, cellY, types.pineWood);
    api.grid.reportActivityAtCell(woodX, cellY);
  }
  const nextHeight = height + 1;
  fillCanopy(api, types, cellX, cellY, nextHeight);
  if (!api.grid.isCellEmptyAtCell(cellX, aboveY)) return;
  if (nextHeight >= TRUNK_HEIGHT) {
    api.elements.createAtCell(cellX, aboveY, types.pineShoot);
    api.grid.reportActivityAtCell(cellX, aboveY);
    return;
  }
  api.elements.createAtCell(cellX, aboveY, types.pineShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: { field1: nextHeight }
  });
  api.grid.reportActivityAtCell(cellX, aboveY);
}
