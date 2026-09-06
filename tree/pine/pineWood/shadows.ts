import { PINE_WOOD_SHADOW_EVENT, PINE_WOOD_SHADOW_REDRAW_RANGE } from "./constants.ts";

export function queuePineWoodShadows(
  api: WorkerSandkitApi,
  cellX: number,
  cellY: number,
): void {
  api.main.emitEvent(PINE_WOOD_SHADOW_EVENT, { cellX, cellY });
}

export function refreshPineWoodShadows(api: SandkitApi, cellX: number, cellY: number): void {
  api.grid.redrawAroundCell(cellX, cellY, PINE_WOOD_SHADOW_REDRAW_RANGE);
}
