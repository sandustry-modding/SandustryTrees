import { ELEMENT } from "../shared/ids.ts";
import { FIELD } from "../shared/field.ts";
import { collapseTrunkAround } from "./collapse.ts";
import { SECOND_SEED_CHANCE } from "./constants.ts";
import { harvestSeedSlotsForCollapse } from "./seeds.ts";

const api = sandkit.api;

export function registerHarvest(pineWoodType: number): void {
  const rawWood = api.elements.getTypeById(ELEMENT.rawWood);
  const pineNeedle = api.elements.getTypeById(ELEMENT.pineNeedle);
  const pineShoot = api.elements.getTypeById(ELEMENT.pineShoot);
  const leafDust = api.elements.getTypeById(ELEMENT.leafDust);
  const pineSeed = api.elements.getTypeById(ELEMENT.pineSeed);

  api.events.on("terrain:destroyed", (payload) => {
    if (payload.cellType !== pineWoodType) return;
    const cellX = payload.cellX ?? payload.x;
    const cellY = payload.cellY ?? payload.y;
    if (typeof cellX !== "number" || typeof cellY !== "number") return;

    const needleScan = {
      isPineWood: (x: number, y: number) => api.terrains.getTypeAtCell(x, y) === pineWoodType,
      isNeedle: (x: number, y: number) => api.elements.isTypeAtCell(x, y, pineNeedle),
      needleRootX: (x: number, y: number) => api.elements.getDataFieldAtCell(x, y, FIELD.rootX) ?? x,
      needleRootY: (x: number, y: number) => api.elements.getDataFieldAtCell(x, y, FIELD.rootY) ?? y,
    };
    const seedSlots = harvestSeedSlotsForCollapse(
      cellX,
      cellY,
      needleScan,
      Math.random() < SECOND_SEED_CHANCE,
    );

    api.grid.mutate((writer) => {
      collapseTrunkAround(cellX, cellY, {
        isPineWood: needleScan.isPineWood,
        isNeedle: needleScan.isNeedle,
        isShoot: (x, y) => api.elements.isTypeAtCell(x, y, pineShoot),
        needleRootX: needleScan.needleRootX,
        removeWood: (x, y) => {
          writer.terrains.removeAtCell(x, y);
        },
        dropRawWood: (x, y) => {
          if (api.elements.getTypeAtCell(x, y) !== null) {
            writer.elements.replaceAtCell(x, y, rawWood, { isFreeFalling: true });
            return;
          }
          writer.elements.createAtCell(x, y, rawWood, { isFreeFalling: true });
        },
        dropLeafDust: (x, y) => {
          writer.elements.replaceAtCell(x, y, leafDust, { isFreeFalling: true });
        },
        seedSlots,
        dropPineSeed: (x, y) => {
          writer.elements.replaceAtCell(x, y, pineSeed, { isFreeFalling: true });
        },
      });
    });
  });
}
