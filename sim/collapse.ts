import { FIELD, SECOND_SEED_CHANCE } from "./constants.ts";
import { harvestSeedSlotsForCollapse } from "./harvestSeeds.ts";
import { treeFields } from "./planting.ts";
import { collapseTrunkAround } from "./trunk.ts";
import type { TreeTypes } from "./types.ts";

function convertFalling(
  api: WorkerSandkitApi,
  cellX: number,
  cellY: number,
  elementType: number,
): void {
  api.elements.replaceAtCell(cellX, cellY, elementType, { isFreeFalling: true });
  api.grid.reportActivityAtCell(cellX, cellY);
}

export function collapseIfUnsupported(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  selfType: number,
): void {
  const { rootX, rootY } = treeFields(api, cellX, cellY);
  if (api.terrains.getTypeAtCell(rootX, rootY) === types.pineWood) return;
  if (selfType === types.pineNeedle) {
    convertFalling(api, cellX, cellY, types.leafDust);
    return;
  }
  convertFalling(api, cellX, cellY, types.rawWood);
}

export function collapseTrunkFromDestroyed(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
): void {
  const needleScan = {
    isPineWood: (x: number, y: number) => api.terrains.getTypeAtCell(x, y) === types.pineWood,
    isNeedle: (x: number, y: number) => api.elements.isTypeAtCell(x, y, types.pineNeedle),
    needleRootX: (x: number, y: number) => api.elements.getDataFieldAtCell(x, y, FIELD.rootX) ?? x,
    needleRootY: (x: number, y: number) => api.elements.getDataFieldAtCell(x, y, FIELD.rootY) ?? y,
  };
  const seedSlots = harvestSeedSlotsForCollapse(
    cellX,
    cellY,
    needleScan,
    Math.random() < SECOND_SEED_CHANCE,
  );

  collapseTrunkAround(cellX, cellY, {
    isPineWood: needleScan.isPineWood,
    isNeedle: needleScan.isNeedle,
    isShoot: (x, y) => api.elements.isTypeAtCell(x, y, types.pineShoot),
    needleRootX: needleScan.needleRootX,
    removeWood: (x, y) => {
      api.terrains.removeAtCell(x, y);
    },
    dropRawWood: (x, y) => {
      if (api.elements.getTypeAtCell(x, y) !== null) {
        api.elements.replaceAtCell(x, y, types.rawWood, { isFreeFalling: true });
      } else {
        api.elements.createAtCell(x, y, types.rawWood, { isFreeFalling: true });
      }
      api.grid.reportActivityAtCell(x, y);
    },
    dropLeafDust: (x, y) => {
      convertFalling(api, x, y, types.leafDust);
    },
    seedSlots,
    dropPineSeed: (x, y) => {
      convertFalling(api, x, y, types.pineSeed);
    },
  });
}
