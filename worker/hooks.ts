import { growPineShoot } from "../grow/growth.ts";
import { tryPlantCone, type PlantTypes } from "../plant/pineShoot.ts";
import { cellFromArgs, xyFromValue } from "../shared/cell.ts";
import { ELEMENT, TERRAIN } from "../shared/ids.ts";

type SimTypes = PlantTypes & { pineWood: number };

function resolveTypes(api: WorkerSandkitApi): SimTypes {
  return {
    pineCone: api.elements.getTypeById(ELEMENT.pineCone),
    pineShoot: api.elements.getTypeById(ELEMENT.pineShoot),
    wetSand: sandkit.enums.ElementType.WetSand,
    pineWood: api.terrains.getTypeById(TERRAIN.pineWood)
  };
}

function onShootDuration(
  api: WorkerSandkitApi,
  types: SimTypes,
  args: Record<string, unknown>,
  context: { cancel(): void }
): void {
  const cell = cellFromArgs(args);
  if (!cell) return;
  growPineShoot(api, types, cell.x, cell.y);
  context.cancel();
}

export function registerSimHooks(api: WorkerSandkitApi): void {
  const types = resolveTypes(api);

  api.hooks.intercept(
    "element:move:blocked",
    (args, context) => {
      const cell = cellFromArgs(args);
      if (cell && tryPlantCone(api, types, cell.x, cell.y)) context.cancel();
    },
    { guard: { elementType: types.pineCone } }
  );

  api.hooks.intercept("element:move", (args, context) => {
    if (args.elementType !== types.pineCone) return;
    const source = xyFromValue(args.source);
    if (source && tryPlantCone(api, types, source.x, source.y)) context.cancel();
  });

  api.hooks.intercept(
    "element:update",
    (args) => {
      const cell = cellFromArgs(args);
      if (cell) tryPlantCone(api, types, cell.x, cell.y);
    },
    { guard: { elementType: types.pineCone } }
  );

  api.hooks.intercept(
    "element:duration",
    (args, context) => {
      onShootDuration(api, types, args, context);
    },
    { guard: { elementType: types.pineShoot } }
  );

  api.hooks.intercept(
    "element:duration:expire",
    (args, context) => {
      onShootDuration(api, types, args, context);
    },
    { guard: { elementType: types.pineShoot } }
  );
}
