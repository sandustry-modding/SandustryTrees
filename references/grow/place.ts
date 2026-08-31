import { FIELD } from "../shared/field.ts";
import type { TreeTypes } from "../shared/types.ts";
import { GROW_DURATION_TICKS, SEED_COUNT_MAX, TRUNK_HALF_WIDTH } from "./constants.ts";
import { treeFields } from "./fields.ts";

export function forEachTrunkColumn(
  rootX: number,
  visit: (cellX: number) => void,
  halfWidth = TRUNK_HALF_WIDTH,
): void {
  for (let dx = -halfWidth; dx <= halfWidth; dx += 1) {
    visit(rootX + dx);
  }
}

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

export function widenTrunk(
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

export function scheduleShootGrowth(api: WorkerSandkitApi, cellX: number, cellY: number): void {
  api.elements.setDurationAtCell(cellX, cellY, GROW_DURATION_TICKS, { updateMax: true });
  api.grid.reportActivityAtCell(cellX, cellY);
}

export function createShoot(
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
