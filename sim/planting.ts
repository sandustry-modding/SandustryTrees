import {
  FIELD,
  GROW_DURATION_TICKS,
  PHASE,
  SEED_COUNT_MAX,
  TRUNK_HALF_WIDTH,
  TRUNK_HALF_WIDTH_MAX,
  TRUNK_HEIGHT_MAX,
} from "./constants.ts";
import { cellFromArgs, collidedAtFromArgs, destinationFromArgs, sourceFromArgs } from "./cell.ts";
import { canopyNewCells } from "./canopy.ts";
import {
  halfWidthForSeedCount,
  seedCountAfterMerge,
  storedSeedCount,
  targetHeightForSeedCount,
} from "./size.ts";
import { forEachTrunkColumn } from "./trunk.ts";
import type { TreeTypes } from "./types.ts";

export function placeNeedleCell(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  rootX: number,
  rootY: number,
): void {
  if (api.terrains.getTypeAtCell(cellX, cellY) === types.pineWood) return;
  if (!api.grid.isCellEmptyAtCell(cellX, cellY)) return;
  api.elements.createAtCell(cellX, cellY, types.pineNeedle, {
    dataFields: { field1: rootX, field2: rootY },
  });
  api.grid.reportActivityAtCell(cellX, cellY);
}

export function placeTrunkRow(
  api: WorkerSandkitApi,
  types: TreeTypes,
  rootX: number,
  cellY: number,
  halfWidth = TRUNK_HALF_WIDTH,
): void {
  forEachTrunkColumn(
    rootX,
    (cellX) => {
      if (api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle)) {
        const needleRootX = api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootX) ?? cellX;
        const needleRootY = api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootY) ?? cellY;
        if (needleRootX === rootX && needleRootY === rootY) {
          api.elements.removeAtCell(cellX, cellY);
        }
      }
      if (!api.grid.isCellEmptyAtCell(cellX, cellY)) return;
      api.terrains.createAtCell(cellX, cellY, types.pineWood);
      api.grid.reportActivityAtCell(cellX, cellY);
    },
    halfWidth,
  );
}

/** True if the shoot can move into this cell. Own needles are removed. Extra shoots from merged seeds are absorbed. */
export function clearGrowthCell(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  rootX: number,
  rootY: number,
  seedCount: number,
): { clear: boolean; seedCount: number } {
  if (api.grid.isCellEmptyAtCell(cellX, cellY)) return { clear: true, seedCount };
  if (api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle)) {
    const needleRootX = api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootX) ?? cellX;
    const needleRootY = api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootY) ?? cellY;
    if (needleRootX !== rootX || needleRootY !== rootY) return { clear: false, seedCount };
    api.elements.removeAtCell(cellX, cellY);
    return { clear: true, seedCount };
  }
  if (api.elements.isTypeAtCell(cellX, cellY, types.pineShoot)) {
    const other = treeFields(api, cellX, cellY);
    if (Math.abs(other.rootY - rootY) > 1) return { clear: false, seedCount };
    api.elements.removeAtCell(cellX, cellY);
    const nextCount = Math.min(SEED_COUNT_MAX, seedCount + other.seedCount);
    return { clear: true, seedCount: nextCount };
  }
  return { clear: false, seedCount };
}

function widenTrunk(
  api: WorkerSandkitApi,
  types: TreeTypes,
  rootX: number,
  rootY: number,
  topY: number,
  halfWidth: number,
): void {
  for (let cellY = topY; cellY <= rootY; cellY += 1) {
    placeTrunkRow(api, types, rootX, cellY, halfWidth);
  }
}

function findMergeShoot(
  api: WorkerSandkitApi,
  types: TreeTypes,
  seedX: number,
  seedY: number,
): { x: number; y: number } | null {
  const left = seedX - (TRUNK_HALF_WIDTH_MAX + 2);
  const right = seedX + (TRUNK_HALF_WIDTH_MAX + 2);
  for (let cellX = left; cellX <= right; cellX += 1) {
    for (let cellY = seedY; cellY >= seedY - TRUNK_HEIGHT_MAX; cellY -= 1) {
      if (!api.elements.isTypeAtCell(cellX, cellY, types.pineShoot)) continue;
      const fields = treeFields(api, cellX, cellY);
      if (Math.abs(fields.rootY - seedY) > 1) continue;
      if (Math.abs(fields.rootX - seedX) > fields.halfWidth + 1) continue;
      return { x: cellX, y: cellY };
    }
  }
  return null;
}

function mergeSeedIntoTree(
  api: WorkerSandkitApi,
  types: TreeTypes,
  seedX: number,
  seedY: number,
  wetX: number,
  wetY: number,
  shoot: { x: number; y: number },
): boolean {
  const fields = treeFields(api, shoot.x, shoot.y);
  const nextCount = seedCountAfterMerge(fields.seedCount, fields.rootX, seedX);
  const nextHalf = halfWidthForSeedCount(nextCount);
  api.elements.removeAtCell(seedX, seedY);
  api.elements.setDataFieldAtCell(shoot.x, shoot.y, FIELD.phase, nextCount);
  if (nextHalf > fields.halfWidth) {
    const topY = Math.min(shoot.y + 1, fields.rootY);
    widenTrunk(api, types, fields.rootX, fields.rootY, topY, nextHalf);
  }
  const nextTarget = targetHeightForSeedCount(nextCount);
  for (const cell of canopyNewCells(
    fields.rootX,
    fields.rootY,
    fields.progress,
    fields.progress,
    nextTarget,
    nextHalf,
    fields.halfWidth,
  )) {
    placeNeedleCell(api, types, cell.x, cell.y, fields.rootX, fields.rootY);
  }
  api.grid.reportActivityAtCell(seedX, seedY);
  api.grid.reportActivityAtCell(wetX, wetY);
  api.grid.reportActivityAtCell(shoot.x, shoot.y);
  return true;
}

export function plantSeedOnWetSand(
  api: WorkerSandkitApi,
  types: TreeTypes,
  seedX: number,
  seedY: number,
  wetX: number,
  wetY: number,
): boolean {
  if (!api.elements.isTypeAtCell(seedX, seedY, types.pineSeed)) return false;
  if (!api.elements.isTypeAtCell(wetX, wetY, types.wetSand)) return false;
  const mergeShoot = findMergeShoot(api, types, seedX, seedY);
  if (mergeShoot && mergeSeedIntoTree(api, types, seedX, seedY, wetX, wetY, mergeShoot)) {
    return true;
  }
  api.elements.removeAtCell(seedX, seedY);
  placeTrunkRow(api, types, seedX, seedY, TRUNK_HALF_WIDTH);
  const shootY = seedY - 1;
  if (api.grid.isCellEmptyAtCell(seedX, shootY)) {
    api.elements.createAtCell(seedX, shootY, types.pineShoot, {
      durationTicks: GROW_DURATION_TICKS,
      dataFields: {
        field1: seedX,
        field2: seedY,
        field3: 1,
        field4: 1,
      },
    });
    api.grid.reportActivityAtCell(seedX, shootY);
  }
  api.grid.reportActivityAtCell(seedX, seedY);
  api.grid.reportActivityAtCell(wetX, wetY);
  return true;
}

function tryPlantSeedTouchingWetSand(
  api: WorkerSandkitApi,
  types: TreeTypes,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): boolean {
  if (plantSeedOnWetSand(api, types, ax, ay, bx, by)) return true;
  return plantSeedOnWetSand(api, types, bx, by, ax, ay);
}

export function plantPineSeedFromBlocked(
  api: WorkerSandkitApi,
  types: TreeTypes,
  args: Record<string, unknown>,
  context: { cancel(): void },
): void {
  const seed = cellFromArgs(args);
  const hit = collidedAtFromArgs(args);
  if (!seed || !hit) return;
  if (!tryPlantSeedTouchingWetSand(api, types, seed.x, seed.y, hit.x, hit.y)) return;
  context.cancel();
}

export function plantPineSeedFromMove(
  api: WorkerSandkitApi,
  types: TreeTypes,
  args: Record<string, unknown>,
  context: { cancel(): void },
): void {
  const seed = sourceFromArgs(args);
  const dest = destinationFromArgs(args);
  if (!seed || !dest) return;
  if (!tryPlantSeedTouchingWetSand(api, types, seed.x, seed.y, dest.x, dest.y)) return;
  context.cancel();
}

export function plantPineSeedFromUpdate(
  api: WorkerSandkitApi,
  types: TreeTypes,
  args: Record<string, unknown>,
): void {
  const seed = cellFromArgs(args);
  if (!seed) return;
  const wet = preferSupportCell(
    seed,
    cardinalNeighbors(seed.x, seed.y).filter((cell) =>
      api.elements.isTypeAtCell(cell.x, cell.y, types.wetSand),
    ),
  );
  if (!wet) return;
  plantSeedOnWetSand(api, types, seed.x, seed.y, wet.x, wet.y);
}

export function treeFields(api: WorkerSandkitApi, cellX: number, cellY: number) {
  const stored = api.elements.getDataFieldAtCell(cellX, cellY, FIELD.phase) ?? 1;
  const seedCount = storedSeedCount(stored);
  const halfWidth = halfWidthForSeedCount(seedCount);
  return {
    rootX: api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootX) ?? cellX,
    rootY: api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootY) ?? cellY,
    progress: api.elements.getDataFieldAtCell(cellX, cellY, FIELD.trunkHeight) ?? 1,
    phase: stored > SEED_COUNT_MAX ? stored : PHASE.growingTrunk,
    seedCount,
    halfWidth,
    targetHeight: targetHeightForSeedCount(seedCount),
  };
}

export function scheduleShootGrowth(api: WorkerSandkitApi, cellX: number, cellY: number): void {
  api.elements.setDurationAtCell(cellX, cellY, GROW_DURATION_TICKS, { updateMax: true });
  api.grid.reportActivityAtCell(cellX, cellY);
}
