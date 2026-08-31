import { collapseIfDetached, type HarvestTypes } from "./collapse.ts";
import { registerGrabShoot } from "./grabShoot.ts";
import { ELEMENT, TERRAIN } from "../shared/ids.ts";

const api = sandkit.api;

function harvestTypes(): HarvestTypes {
  return {
    pineWood: api.terrains.getTypeById(TERRAIN.pineWood),
    pineNeedle: api.elements.getTypeById(ELEMENT.pineNeedle),
    pineShoot: api.elements.getTypeById(ELEMENT.pineShoot),
    pineCone: api.elements.getTypeById(ELEMENT.pineCone),
    wetSand: sandkit.enums.ElementType.WetSand,
    wood: api.elements.getTypeById(ELEMENT.wood),
    leafDust: api.elements.getTypeById(ELEMENT.leafDust)
  };
}

export function registerHarvest(): void {
  const types = harvestTypes();
  registerGrabShoot();
  api.events.on("terrain:destroyed", (payload) => {
    if (payload.cellType !== types.pineWood) return;
    const cellX = payload.cellX ?? payload.x;
    const cellY = payload.cellY ?? payload.y;
    if (typeof cellX !== "number" || typeof cellY !== "number") return;
    api.grid.mutate((writer) => {
      collapseIfDetached(api, types, cellX, cellY, writer);
    });
  });
}
