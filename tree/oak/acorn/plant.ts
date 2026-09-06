import { GROW_DURATION_TICKS } from "../oakShoot/constants.ts";
import { DIRS } from "../../../shared/dirs.ts";

export type PlantTypes = {
  acorn: number;
  oakShoot: number;
  water: number;
};

function isDirtBelow(api: WorkerSandkitApi, cellX: number, cellY: number): boolean {
  return api.terrains.getTypeAtCell(cellX, cellY + 1) === sandkit.enums.CellType.Dirt;
}

export function tryPlantAcorn(
  api: WorkerSandkitApi,
  types: PlantTypes,
  cellX: number,
  cellY: number,
): boolean {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.acorn)) return false;
  if (!isDirtBelow(api, cellX, cellY)) return false;
  const water = DIRS.map(([dx, dy]) => ({ x: cellX + dx, y: cellY + dy })).find((cell) =>
    api.elements.isTypeAtCell(cell.x, cell.y, types.water),
  );
  if (!water) return false;
  api.elements.removeAtCell(water.x, water.y);
  api.elements.replaceAtCell(cellX, cellY, types.oakShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: { field1: 0 },
  });
  api.grid.reportActivityAtCell(cellX, cellY);
  api.grid.reportActivityAtCell(water.x, water.y);
  return true;
}
