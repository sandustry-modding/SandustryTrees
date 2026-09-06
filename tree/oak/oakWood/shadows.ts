import { config } from "../../../config.ts";
import { OAK_WOOD_SHADOW_EVENT } from "./constants.ts";

export function queueOakWoodShadows(api: WorkerSandkitApi, cellX: number, cellY: number): void {
  api.main.emitEvent(OAK_WOOD_SHADOW_EVENT, { cellX, cellY });
}

export function refreshOakWoodShadows(api: SandkitApi, cellX: number, cellY: number): void {
  api.grid.redrawAroundCell(cellX, cellY, config.oakWoodShadowRedrawRange);
}
