import {
  canopyKeepCells,
  canopyNewCells,
  canopySearchHalf,
  canopyTipY,
  canopyTreeTopY,
} from "./canopy.ts";
import {
  CANOPY_MIN_TRUNK_HEIGHT,
  FIELD,
  GROW_DURATION_TICKS,
  PHASE,
  TRUNK_GROW_ROWS_PER_TICK,
  TRUNK_HEIGHT_MAX,
} from "./constants.ts";
import {
  clearGrowthCell,
  placeNeedleCell,
  placeTrunkRow,
  scheduleShootGrowth,
  treeFields,
} from "./planting.ts";
import { halfWidthForSeedCount, targetHeightForSeedCount } from "./size.ts";
import type { TreeTypes } from "./types.ts";

function createShoot(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  rootX: number,
  rootY: number,
  progress: number,
  seedCount: number,
): void {
  api.elements.createAtCell(cellX, cellY, types.pineShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: {
      field1: rootX,
      field2: rootY,
      field3: progress,
      field4: seedCount,
    },
  });
  scheduleShootGrowth(api, cellX, cellY);
  api.grid.reportActivityAtCell(cellX, cellY);
}

function fillCanopy(
  api: WorkerSandkitApi,
  types: TreeTypes,
  rootX: number,
  rootY: number,
  height: number,
  previousHeight: number,
  targetHeight: number,
  halfWidth: number,
): void {
  const keep = canopyKeepCells(rootX, rootY, height, targetHeight, halfWidth);
  const keepKeys = new Set(keep.map((cell) => `${cell.x},${cell.y}`));
  const searchTop = canopyTipY(rootY, TRUNK_HEIGHT_MAX) - 1;
  const searchHalf = canopySearchHalf(halfWidth);
  const left = rootX - searchHalf;
  const right = rootX + searchHalf;
  for (let cellX = left; cellX <= right; cellX += 1) {
    for (let cellY = searchTop; cellY < rootY; cellY += 1) {
      if (!api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle)) continue;
      if ((api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootX) ?? cellX) !== rootX) continue;
      if ((api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootY) ?? cellY) !== rootY) continue;
      if (keepKeys.has(`${cellX},${cellY}`)) continue;
      api.elements.removeAtCell(cellX, cellY);
    }
  }
  if (height < CANOPY_MIN_TRUNK_HEIGHT) return;
  for (const cell of canopyNewCells(
    rootX,
    rootY,
    height,
    previousHeight,
    targetHeight,
    halfWidth,
  )) {
    placeNeedleCell(api, types, cell.x, cell.y, rootX, rootY);
  }
}

function finishCanopy(
  api: WorkerSandkitApi,
  types: TreeTypes,
  shootX: number,
  shootY: number,
  fields: { rootX: number; rootY: number; targetHeight: number },
): void {
  placeNeedleCell(
    api,
    types,
    fields.rootX,
    canopyTipY(fields.rootY, fields.targetHeight),
    fields.rootX,
    fields.rootY,
  );
  if (!api.elements.isTypeAtCell(shootX, shootY, types.pineShoot)) return;
  if (api.terrains.getTypeAtCell(shootX, shootY) === types.pineWood) {
    api.elements.removeAtCell(shootX, shootY);
    return;
  }
  if (shootY >= canopyTreeTopY(fields.rootY, fields.targetHeight)) {
    api.elements.removeAtCell(shootX, shootY);
    return;
  }
  api.elements.replaceAtCell(shootX, shootY, types.pineNeedle, {
    dataFields: { field1: fields.rootX, field2: fields.rootY },
  });
  api.grid.reportActivityAtCell(shootX, shootY);
}

function growTrunk(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  fields: {
    rootX: number;
    rootY: number;
    progress: number;
    phase: number;
    targetHeight: number;
    halfWidth: number;
    seedCount: number;
  },
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
      for (let cellY = shootY + 1; cellY <= fields.rootY; cellY += 1) {
        placeTrunkRow(api, types, fields.rootX, cellY, halfWidth);
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
  growTrunk(api, types, cellX, cellY, fields);
}
