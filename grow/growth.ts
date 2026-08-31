import { GROW_DURATION_TICKS, TRUNK_HEIGHT } from "./constants.ts";

export type GrowTypes = {
  pineShoot: number;
  pineWood: number;
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
  if (api.grid.isCellEmptyAtCell(cellX, cellY)) {
    api.terrains.createAtCell(cellX, cellY, types.pineWood);
    api.grid.reportActivityAtCell(cellX, cellY);
  }
  const nextHeight = height + 1;
  if (nextHeight >= TRUNK_HEIGHT) return;
  if (!api.grid.isCellEmptyAtCell(cellX, aboveY)) return;
  api.elements.createAtCell(cellX, aboveY, types.pineShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: { field1: nextHeight }
  });
  api.grid.reportActivityAtCell(cellX, aboveY);
}
