import { spawnCanopyCones } from "../pineCone/spawn.ts";
import { fillCanopy } from "../pineNeedle/fill.ts";
import {
  GROW_DURATION_TICKS,
  TRUNK_BASE_FLARE_ROWS,
  TRUNK_GROW_ROWS_PER_TICK,
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

function growOneRow(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
  height: number,
): { nextHeight: number; shootY: number; blocked: boolean; mature: boolean } {
  const nextHeight = height + 1;
  const aboveY = cellY - 1;
  placeWood(api, types, cellX, cellY, trunkHalfWidthAt(nextHeight));
  if (nextHeight >= TRUNK_HEIGHT) {
    return { nextHeight, shootY: cellY, blocked: false, mature: true };
  }
  if (!api.grid.isCellEmptyAtCell(cellX, aboveY)) {
    return { nextHeight, shootY: cellY, blocked: true, mature: false };
  }
  return { nextHeight, shootY: aboveY, blocked: false, mature: false };
}

function finishShape(
  api: WorkerSandkitApi,
  types: GrowTypes,
  rootX: number,
  woodY: number,
  height: number,
  previousHeight: number,
): void {
  const rootY = woodY + height - 1;
  widenBase(api, types, rootX, rootY, height);
  fillCanopy(api, types, rootX, woodY, height, previousHeight);
  if (height >= TRUNK_HEIGHT) {
    spawnCanopyCones(api, types, rootX, woodY, height);
  }
}

export function growPineShoot(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.pineShoot)) return;
  const startHeight = api.elements.getDataFieldAtCell(cellX, cellY, 1) ?? 0;
  let height = startHeight;
  let shootX = cellX;
  let shootY = cellY;
  let woodY = cellY;
  api.elements.removeAtCell(cellX, cellY);

  let placed = false;
  let mature = false;
  let blocked = false;
  for (let step = 0; step < TRUNK_GROW_ROWS_PER_TICK; step += 1) {
    const result = growOneRow(api, types, shootX, shootY, height);
    height = result.nextHeight;
    woodY = shootY;
    placed = true;
    mature = result.mature;
    blocked = result.blocked;
    if (result.mature || result.blocked) break;
    shootY = result.shootY;
  }

  if (placed) finishShape(api, types, shootX, woodY, height, startHeight);
  if (mature || blocked) return;

  api.elements.createAtCell(shootX, shootY, types.pineShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: { field1: height },
  });
  api.grid.reportActivityAtCell(shootX, shootY);
}
