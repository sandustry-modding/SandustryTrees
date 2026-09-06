import { queueOakWoodShadows } from "../oakWood/shadows.ts";
import { spawnCanopyAcorns } from "../acorn/spawn.ts";
import { desiredBranchCells, fillCanopy } from "../oakLeaf/fill.ts";
import { runWithoutCollapse } from "../oakWood/collapse.ts";
import { config, trunkGrowRowsPerTick } from "../../../config.ts";
import { trunkBaseExtraHalf, trunkHalfWidthAt, trunkHalfWidthFromRoot } from "./constants.ts";

export type GrowTypes = {
  oakShoot: number;
  oakWood: number;
  oakLeaf: number;
  acorn: number;
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
    if (api.elements.isTypeAtCell(woodX, cellY, types.oakLeaf)) {
      api.elements.removeAtCell(woodX, cellY);
    }
    if (!api.grid.isCellEmptyAtCell(woodX, cellY)) continue;
    api.terrains.createAtCell(woodX, cellY, types.oakWood, { skipShadow: false });
    queueOakWoodShadows(api, woodX, cellY);
  }
}

function widenTrunk(
  api: WorkerSandkitApi,
  types: GrowTypes,
  rootX: number,
  rootY: number,
  height: number,
): void {
  const extraHalf = trunkBaseExtraHalf(height);
  const bole = Math.min(height, config.oakTrunkForkHeight);
  for (let dy = 0; dy < bole; dy += 1) {
    const cellY = rootY - dy;
    const half = trunkHalfWidthFromRoot(dy, extraHalf, height);
    placeWood(api, types, rootX, cellY, half);
  }
}

function clearLeavesAt(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
): void {
  if (api.elements.isTypeAtCell(cellX, cellY, types.oakLeaf)) {
    api.elements.removeAtCell(cellX, cellY);
  }
}

function placeBranchCell(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
): void {
  if (api.terrains.getTypeAtCell(cellX, cellY) === types.oakWood) return;
  if (api.elements.isTypeAtCell(cellX, cellY, types.oakLeaf)) {
    api.elements.removeAtCell(cellX, cellY);
  }
  api.terrains.createAtCell(cellX, cellY, types.oakWood, { skipShadow: false });
  queueOakWoodShadows(api, cellX, cellY);
  api.grid.reportActivityAtCell(cellX, cellY);
}

function clearShootPath(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
): void {
  clearLeavesAt(api, types, cellX, cellY);
  if (api.terrains.getTypeAtCell(cellX, cellY) === types.oakWood) {
    api.terrains.removeAtCell(cellX, cellY);
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
  if (nextHeight <= config.oakTrunkForkHeight) {
    placeWood(api, types, cellX, cellY, trunkHalfWidthAt(nextHeight));
  }
  if (nextHeight >= config.oakTrunkHeight) {
    return { nextHeight, shootY: cellY, blocked: false, mature: true };
  }
  clearShootPath(api, types, cellX, aboveY);
  const aboveTerrain = api.terrains.getTypeAtCell(cellX, aboveY);
  if (aboveTerrain != null && aboveTerrain !== 0 && aboveTerrain !== types.oakWood) {
    return { nextHeight, shootY: cellY, blocked: true, mature: false };
  }
  return { nextHeight, shootY: aboveY, blocked: false, mature: false };
}

function placeCrownBranches(
  api: WorkerSandkitApi,
  types: GrowTypes,
  rootX: number,
  rootY: number,
  height: number,
): void {
  for (const cell of desiredBranchCells(rootX, rootY, height)) {
    placeBranchCell(api, types, cell.x, cell.y);
  }
}

function finishShape(
  api: WorkerSandkitApi,
  types: GrowTypes,
  rootX: number,
  rootY: number,
  height: number,
): void {
  widenTrunk(api, types, rootX, rootY, height);
  placeCrownBranches(api, types, rootX, rootY, height);
}

export function growOakShoot(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
): void {
  runWithoutCollapse(() => growOakShootInner(api, types, cellX, cellY));
}

function growOakShootInner(
  api: WorkerSandkitApi,
  types: GrowTypes,
  cellX: number,
  cellY: number,
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.oakShoot)) return;
  const startHeight = api.elements.getDataFieldAtCell(cellX, cellY, 1) ?? 0;
  let height = startHeight;
  let shootX = cellX;
  let shootY = cellY;
  let woodY = cellY;
  api.elements.removeAtCell(cellX, cellY);

  let placed = false;
  let mature = false;
  let blocked = false;
  for (let step = 0; step < trunkGrowRowsPerTick(); step += 1) {
    const result = growOneRow(api, types, shootX, shootY, height);
    height = result.nextHeight;
    woodY = shootY;
    placed = true;
    mature = result.mature;
    blocked = result.blocked;
    if (result.mature || result.blocked) break;
    shootY = result.shootY;
  }

  const rootY = woodY + height - 1;
  if (placed) finishShape(api, types, shootX, rootY, height);
  if (mature) {
    fillCanopy(api, types, shootX, rootY, height, startHeight);
    spawnCanopyAcorns(api, types, shootX, rootY, height);
    return;
  }
  if (blocked) return;

  api.elements.createAtCell(shootX, shootY, types.oakShoot, {
    durationTicks: config.oakGrowDurationTicks,
    dataFields: { field1: height },
  });
  api.grid.reportActivityAtCell(shootX, shootY);
  fillCanopy(api, types, shootX, rootY, height, startHeight);
}
