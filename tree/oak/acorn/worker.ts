import { tryPlantAcorn, type PlantTypes } from "./plant.ts";
import { cellFromArgs, xyFromValue } from "../../../shared/cell.ts";

export function registerWorker(api: WorkerSandkitApi, types: PlantTypes): void {
  api.hooks.intercept(
    "element:move:blocked",
    (args, context) => {
      const cell = cellFromArgs(args);
      if (cell && tryPlantAcorn(api, types, cell.x, cell.y)) context.cancel();
    },
    { guard: { elementType: types.acorn } },
  );

  api.hooks.intercept("element:move", (args, context) => {
    if (args.elementType !== types.acorn) return;
    const source = xyFromValue(args.source);
    if (source && tryPlantAcorn(api, types, source.x, source.y)) context.cancel();
  });

  api.hooks.intercept(
    "element:update",
    (args) => {
      const cell = cellFromArgs(args);
      if (cell) tryPlantAcorn(api, types, cell.x, cell.y);
    },
    { guard: { elementType: types.acorn } },
  );
}
