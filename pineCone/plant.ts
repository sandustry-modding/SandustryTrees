import { GROW_DURATION_TICKS } from "../pineShoot/constants.ts";
import { DIRS } from "../shared/dirs.ts";

export type PlantTypes = {
  pineCone: number;
  pineShoot: number;
};

function isDirtAt(api: WorkerSandkitApi, cellX: number, cellY: number): boolean {
  return api.terrains.getTypeAtCell(cellX, cellY) === sandkit.enums.CellType.Dirt;
}

export function tryPlantCone(
  api: WorkerSandkitApi,
  types: PlantTypes,
  cellX: number,
  cellY: number
): boolean {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.pineCone)) return false;
  const dirt = DIRS.map(([dx, dy]) => ({ x: cellX + dx, y: cellY + dy })).find((cell) =>
    isDirtAt(api, cell.x, cell.y)
  );
  if (!dirt) return false;
  api.elements.replaceAtCell(cellX, cellY, types.pineShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: { field1: 0 }
  });
  api.grid.reportActivityAtCell(cellX, cellY);
  api.grid.reportActivityAtCell(dirt.x, dirt.y);
  return true;
}
