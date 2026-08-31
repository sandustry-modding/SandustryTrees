import { canopyNewCells } from "../canopy/shape.ts";
import { TRUNK_HEIGHT_MAX, SEED_COUNT_MAX } from "../grow/constants.ts";
import { treeFields } from "../grow/fields.ts";
import { placeNeedleCell, widenTrunk } from "../grow/place.ts";
import { halfWidthForSeedCount, seedCountAfterMerge, targetHeightForSeedCount } from "../grow/size.ts";
import { FIELD } from "../shared/field.ts";
import type { TreeFields, TreeTypes } from "../shared/types.ts";
import { SEED_ABSORB_RADIUS } from "./constants.ts";
import { absorbCellOffsets, initialAbsorbProgress, isAbsorbWaiting } from "./wait.ts";

function findMergeShoot(
  api: WorkerSandkitApi,
  types: TreeTypes,
  seedX: number,
  seedY: number,
): { x: number; y: number } | null {
  const r = SEED_ABSORB_RADIUS;
  for (let cellX = seedX - r; cellX <= seedX + r; cellX += 1) {
    for (let cellY = seedY; cellY >= seedY - TRUNK_HEIGHT_MAX; cellY -= 1) {
      if (!api.elements.isTypeAtCell(cellX, cellY, types.pineShoot)) continue;
      const fields = treeFields(api, cellX, cellY);
      if (Math.abs(fields.rootX - seedX) > r) continue;
      if (Math.abs(fields.rootY - seedY) > r) continue;
      return { x: cellX, y: cellY };
    }
  }
  return null;
}

export function mergeSeedIntoTree(
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
  if (isAbsorbWaiting(fields.progress)) {
    api.elements.setDataFieldAtCell(shoot.x, shoot.y, FIELD.trunkHeight, initialAbsorbProgress());
  }
  if (nextHalf > fields.halfWidth) {
    const topY = Math.min(shoot.y + 1, fields.rootY);
    widenTrunk(api, types, fields.rootX, fields.rootY, topY, nextHalf);
  }
  if (!isAbsorbWaiting(fields.progress)) {
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
  }
  api.grid.reportActivityAtCell(seedX, seedY);
  api.grid.reportActivityAtCell(wetX, wetY);
  api.grid.reportActivityAtCell(shoot.x, shoot.y);
  return true;
}

export function tryMergeSeedIntoNearbyTree(
  api: WorkerSandkitApi,
  types: TreeTypes,
  seedX: number,
  seedY: number,
  wetX: number,
  wetY: number,
): boolean {
  const mergeShoot = findMergeShoot(api, types, seedX, seedY);
  if (!mergeShoot) return false;
  return mergeSeedIntoTree(api, types, seedX, seedY, wetX, wetY, mergeShoot);
}

/**
 * Pull Pine Seeds from the 7×7 window around the root.
 * More seeds raise mature height and trunk width.
 */
export function absorbSeedsAroundRoot(
  api: WorkerSandkitApi,
  types: TreeTypes,
  shootX: number,
  shootY: number,
  fields: TreeFields,
): TreeFields & { absorbed: number } {
  let seedCount = fields.seedCount;
  const previousHalf = fields.halfWidth;
  let absorbed = 0;

  if (seedCount < SEED_COUNT_MAX) {
    for (const { dx, dy } of absorbCellOffsets()) {
      if (seedCount >= SEED_COUNT_MAX) break;
      const cellX = fields.rootX + dx;
      const cellY = fields.rootY + dy;
      if (!api.elements.isTypeAtCell(cellX, cellY, types.pineSeed)) continue;
      api.elements.removeAtCell(cellX, cellY);
      seedCount = seedCountAfterMerge(seedCount, fields.rootX, cellX);
      absorbed += 1;
      api.grid.reportActivityAtCell(cellX, cellY);
    }
  }

  const halfWidth = halfWidthForSeedCount(seedCount);
  const targetHeight = targetHeightForSeedCount(seedCount);
  const progress = fields.progress;

  if (halfWidth > previousHalf) {
    const topY = Math.min(shootY + 1, fields.rootY);
    widenTrunk(api, types, fields.rootX, fields.rootY, topY, halfWidth);
  }

  if (absorbed > 0 && !isAbsorbWaiting(progress)) {
    for (const cell of canopyNewCells(
      fields.rootX,
      fields.rootY,
      Math.max(1, progress),
      Math.max(1, progress),
      targetHeight,
      halfWidth,
      previousHalf,
    )) {
      placeNeedleCell(api, types, cell.x, cell.y, fields.rootX, fields.rootY);
    }
  }

  if (absorbed > 0) {
    api.elements.setDataFieldAtCell(shootX, shootY, FIELD.phase, seedCount);
    api.grid.reportActivityAtCell(shootX, shootY);
  }

  return {
    rootX: fields.rootX,
    rootY: fields.rootY,
    progress,
    phase: fields.phase,
    seedCount,
    halfWidth,
    targetHeight,
    absorbed,
  };
}
