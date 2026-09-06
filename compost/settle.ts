import { config } from "../config.ts";

const dirtType = () => sandkit.enums.CellType.Dirt;

/** Worker: fill the cell with dirt in the same tick so neighbors cannot fall in. */
export function convertWetCompostToDirt(
  api: WorkerSandkitApi,
  wetCompost: number,
  cellX: number,
  cellY: number,
): boolean {
  if (!api.elements.isTypeAtCell(cellX, cellY, wetCompost)) return false;
  api.elements.removeAtCell(cellX, cellY);
  if (!api.grid.isCellEmptyAtCell(cellX, cellY)) return false;
  api.terrains.createAtCell(cellX, cellY, dirtType(), { skipShadow: false });
  api.grid.reportActivityAtCell(cellX, cellY);
  return api.grid.isTerrainAtCell(cellX, cellY);
}

export function applyWetCompostSettle(
  api: SandkitApi,
  wetCompost: number,
  cellX: number,
  cellY: number,
): boolean {
  if (!api.elements.isTypeAtCell(cellX, cellY, wetCompost)) {
    refreshDirtShadows(api, cellX, cellY);
    return api.grid.isTerrainAtCell(cellX, cellY);
  }
  const dirt = dirtType();
  api.grid.mutate((writer) => {
    writer.elements.removeAtCell(cellX, cellY);
    writer.terrains.createAtCell(cellX, cellY, dirt, { skipShadow: false });
  });
  api.grid.reportActivityAtCell(cellX, cellY);
  refreshDirtShadows(api, cellX, cellY);
  return true;
}

export function refreshDirtShadows(api: SandkitApi, cellX: number, cellY: number): void {
  api.grid.redrawAroundCell(cellX, cellY, config.dirtShadowRedrawRange);
}
