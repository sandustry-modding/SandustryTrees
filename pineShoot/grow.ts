import { spawnCanopyCones } from "../pineCone/spawn.ts";
import { fillCanopy } from "../pineNeedle/fill.ts";
import {
  GROW_DURATION_TICKS,
  TRUNK_BASE_FLARE_ROWS,
  TRUNK_HEIGHT,
  trunkBaseExtraHalf,
  trunkHalfWidthAt,
  trunkHalfWidthFromRoot,
} from "./constants.ts";

export type GrowTypes = {
  pineShoot: number;
  pineWood: number;
  pineNeedle: number;
  pineCone: number;
};

function placeWood(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
  half: number,
): void {
  for (let dx = -half; dx <= half; dx += 1) {
    const woodX = cellX + dx;
    if (api.elements.isTypeAtCell(woodX, cellY, types.pineNeedle)) {
      api.elements.removeAtCell(woodX, cellY);
    }
    if (!api.grid.isCellEmptyAtCell(woodX, cellY)) continue;
    api.terrains.createAtCell(woodX, cellY, types.pineWood);
    api.grid.reportActivityAtCell(woodX, cellY);
  }
}

function widenBase(
  api: WorkerSandkitApi,
  types: GrowTypes,
  rootX: number,
  rootY: number,
  height: number,
): void {
  const extraHalf = trunkBaseExtraHalf(height);
  if (extraHalf <= 0) return;
  const rows = Math.min(TRUNK_BASE_FLARE_ROWS, height);
  for (let dy = 0; dy < rows; dy += 1) {
    const cellY = rootY - dy;
    const half = trunkHalfWidthFromRoot(dy, extraHalf);
    placeWood(api, types, rootX, cellY, half);
  }
}

export function growPineShoot(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.pineShoot)) return;
  const height = api.elements.getDataFieldAtCell(cellX, cellY, 1) ?? 0;
  const aboveY = cellY - 1;
  api.elements.removeAtCell(cellX, cellY);
  const nextHeight = height + 1;
  placeWood(api, types, cellX, cellY, trunkHalfWidthAt(nextHeight));
  const rootY = cellY + nextHeight - 1;
  widenBase(api, types, cellX, rootY, nextHeight);
  fillCanopy(api, types, cellX, cellY, nextHeight);
  if (nextHeight >= TRUNK_HEIGHT) {
    spawnCanopyCones(api, types, cellX, cellY, nextHeight);
    return;
  }
  if (!api.grid.isCellEmptyAtCell(cellX, aboveY)) return;
  api.elements.createAtCell(cellX, aboveY, types.pineShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: { field1: nextHeight },
  });
  api.grid.reportActivityAtCell(cellX, aboveY);
}
