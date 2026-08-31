import { CANOPY_MIN_TRUNK_HEIGHT } from "../canopy/constants.ts";
import { fillCanopy, finishCanopy } from "../canopy/fill.ts";
import { absorbSeedsAroundRoot } from "../plant/merge.ts";
import { isAbsorbWaiting, nextAbsorbProgress } from "../plant/wait.ts";
import { FIELD } from "../shared/field.ts";
import type { TreeFields, TreeTypes } from "../shared/types.ts";
import { PHASE, TRUNK_GROW_ROWS_PER_TICK } from "./constants.ts";
import { treeFields } from "./fields.ts";
import { clearGrowthCell, createShoot, placeTrunkRow, scheduleShootGrowth } from "./place.ts";
import { halfWidthForSeedCount, targetHeightForSeedCount } from "./size.ts";

function growTrunk(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  fields: TreeFields,
): void {
  const previousHeight = fields.progress;
  let height = fields.progress;
  let shootY = cellY;
  let seedCount = fields.seedCount;
  let halfWidth = fields.halfWidth;
  let targetHeight = fields.targetHeight;
  api.elements.removeAtCell(cellX, cellY);

  for (let step = 0; step < TRUNK_GROW_ROWS_PER_TICK; step += 1) {
    if (height >= targetHeight) break;
    const nextY = shootY - 1;
    const growth = clearGrowthCell(api, types, cellX, nextY, fields.rootX, fields.rootY, seedCount);
    if (!growth.clear) {
      createShoot(api, types, cellX, shootY, fields.rootX, fields.rootY, height, seedCount);
      fillCanopy(
        api,
        types,
        fields.rootX,
        fields.rootY,
        height,
        previousHeight,
        targetHeight,
        halfWidth,
      );
      return;
    }
    if (growth.seedCount !== seedCount) {
      seedCount = growth.seedCount;
      halfWidth = halfWidthForSeedCount(seedCount);
      targetHeight = targetHeightForSeedCount(seedCount);
      for (let woodY = shootY + 1; woodY <= fields.rootY; woodY += 1) {
        placeTrunkRow(api, types, fields.rootX, woodY, halfWidth);
      }
    }
    placeTrunkRow(api, types, fields.rootX, shootY, halfWidth);
    height += 1;
    shootY = nextY;
  }

  createShoot(api, types, cellX, shootY, fields.rootX, fields.rootY, height, seedCount);
  fillCanopy(
    api,
    types,
    fields.rootX,
    fields.rootY,
    height,
    previousHeight,
    targetHeight,
    halfWidth,
  );
  if (height >= targetHeight) {
    finishCanopy(api, types, cellX, shootY, { ...fields, targetHeight });
  }
}

function waitForSeeds(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  fields: TreeFields,
): void {
  const absorbed = absorbSeedsAroundRoot(api, types, cellX, cellY, fields);
  const nextProgress = nextAbsorbProgress(fields.progress, absorbed.absorbed > 0);
  if (isAbsorbWaiting(nextProgress)) {
    api.elements.setDataFieldAtCell(cellX, cellY, FIELD.trunkHeight, nextProgress);
    api.elements.setDataFieldAtCell(cellX, cellY, FIELD.phase, absorbed.seedCount);
    scheduleShootGrowth(api, cellX, cellY);
    return;
  }
  growTrunk(api, types, cellX, cellY, {
    ...absorbed,
    progress: 1,
  });
}

export function growPineShoot(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.pineShoot)) return;
  const fields = treeFields(api, cellX, cellY);
  if (fields.phase === PHASE.mature) {
    api.elements.removeAtCell(cellX, cellY);
    return;
  }
  if (fields.phase === PHASE.growingCanopy) {
    fillCanopy(
      api,
      types,
      fields.rootX,
      fields.rootY,
      fields.targetHeight,
      CANOPY_MIN_TRUNK_HEIGHT - 1,
      fields.targetHeight,
      fields.halfWidth,
    );
    finishCanopy(api, types, cellX, cellY, fields);
    return;
  }
  if (isAbsorbWaiting(fields.progress)) {
    waitForSeeds(api, types, cellX, cellY, fields);
    return;
  }
  const absorbed = absorbSeedsAroundRoot(api, types, cellX, cellY, fields);
  growTrunk(api, types, cellX, cellY, absorbed);
}
