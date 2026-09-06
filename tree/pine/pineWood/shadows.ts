import { config } from "../../../config.ts";
import { PINE_WOOD_SHADOW_EVENT } from "./constants.ts";

export function queuePineWoodShadows(api: WorkerSandkitApi, cellX: number, cellY: number): void {
  api.main.emitEvent(PINE_WOOD_SHADOW_EVENT, { cellX, cellY });
}

export function refreshPineWoodShadows(api: SandkitApi, cellX: number, cellY: number): void {
  api.grid.redrawAroundCell(cellX, cellY, config.pineWoodShadowRedrawRange);
}
