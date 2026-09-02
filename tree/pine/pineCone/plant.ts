import { GROW_DURATION_TICKS } from "../pineShoot/constants.ts";
import { DIRS } from "../../../shared/dirs.ts";

export type PlantTypes = {
  pineCone: number;
  pineShoot: number;
  water: number;
};

export function tryPlantCone(
  api: WorkerSandkitApi,
  types: PlantTypes,
  cellX: number,
  cellY: number,
): boolean {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.pineCone)) return false;
  const water = DIRS.map(([dx, dy]) => ({ x: cellX + dx, y: cellY + dy })).find((cell) =>
    api.elements.isTypeAtCell(cell.x, cell.y, types.water),
  );
  if (!water) return false;
  api.elements.removeAtCell(water.x, water.y);
  api.elements.replaceAtCell(cellX, cellY, types.pineShoot, {
    durationTicks: GROW_DURATION_TICKS,
    dataFields: { field1: 0 },
  });
  api.grid.reportActivityAtCell(cellX, cellY);
  api.grid.reportActivityAtCell(water.x, water.y);
  return true;
}
