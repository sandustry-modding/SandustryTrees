import { collapseIfDetached, type HarvestTypes } from "./collapse.ts";
import { ELEMENT, TERRAIN } from "../../../shared/ids.ts";
import { OAK_WOOD_SHADOW_EVENT } from "./constants.ts";
import { refreshOakWoodShadows } from "./shadows.ts";

const api = sandkit.api;

export function harvestTypes(): HarvestTypes {
  return {
    oakWood: api.terrains.getTypeById(TERRAIN.oakWood),
    oakLeaf: api.elements.getTypeById(ELEMENT.oakLeaf),
    oakShoot: api.elements.getTypeById(ELEMENT.oakShoot),
    acorn: api.elements.getTypeById(ELEMENT.acorn),
    wood: api.elements.getTypeById(ELEMENT.wood),
    compost: api.elements.getTypeById(ELEMENT.compost),
  };
}

export function registerMain(): void {
  const types = harvestTypes();
  api.events.on(OAK_WOOD_SHADOW_EVENT, (payload) => {
    const record = payload as { cellX?: number; cellY?: number; x?: number; y?: number };
    const cellX = record.cellX ?? record.x;
    const cellY = record.cellY ?? record.y;
    if (typeof cellX !== "number" || typeof cellY !== "number") return;
    refreshOakWoodShadows(api, cellX, cellY);
  });
  api.events.on("terrain:destroyed", (payload) => {
    if (payload.cellType !== types.oakWood) return;
    const cellX = payload.cellX ?? payload.x;
    const cellY = payload.cellY ?? payload.y;
    if (typeof cellX !== "number" || typeof cellY !== "number") return;
    api.grid.mutate((writer) => {
      collapseIfDetached(api, types, cellX, cellY, writer, {
        omitCell: { x: cellX, y: cellY },
      });
    });
    refreshOakWoodShadows(api, cellX, cellY);
  });
}
