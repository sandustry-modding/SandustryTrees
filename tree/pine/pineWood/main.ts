import { collapseIfDetached, type HarvestTypes } from "./collapse.ts";
import { ELEMENT, TERRAIN } from "../../../shared/ids.ts";

const api = sandkit.api;

export function harvestTypes(): HarvestTypes {
  return {
    pineWood: api.terrains.getTypeById(TERRAIN.pineWood),
    pineNeedle: api.elements.getTypeById(ELEMENT.pineNeedle),
    pineShoot: api.elements.getTypeById(ELEMENT.pineShoot),
    pineCone: api.elements.getTypeById(ELEMENT.pineCone),
    wood: api.elements.getTypeById(ELEMENT.wood),
    compost: api.elements.getTypeById(ELEMENT.compost),
  };
}

export function registerMain(): void {
  const types = harvestTypes();
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
