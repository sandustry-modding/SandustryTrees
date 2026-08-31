import { growPineShoot } from "../grow/growth.ts";
import { collapseIfDetached, type HarvestTypes } from "../harvest/collapse.ts";
import { tryPlantCone, type PlantTypes } from "../plant/pineShoot.ts";
import { cellFromArgs, xyFromValue } from "../shared/cell.ts";
import { ELEMENT, TERRAIN } from "../shared/ids.ts";

type SimTypes = PlantTypes & HarvestTypes;

function resolveTypes(api: WorkerSandkitApi): SimTypes {
  return {
    pineCone: api.elements.getTypeById(ELEMENT.pineCone),
    pineShoot: api.elements.getTypeById(ELEMENT.pineShoot),
    wetSand: sandkit.enums.ElementType.WetSand,
    pineWood: api.terrains.getTypeById(TERRAIN.pineWood),
    pineNeedle: api.elements.getTypeById(ELEMENT.pineNeedle),
    wood: api.elements.getTypeById(ELEMENT.wood),
    leafDust: api.elements.getTypeById(ELEMENT.leafDust)
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
  collapseIfDetached(api, types, cell.x, cell.y);
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

  api.hooks.intercept(
    "element:update",
    (args) => {
      const cell = cellFromArgs(args);
      if (cell) collapseIfDetached(api, types, cell.x, cell.y);
    },
    { guard: { elementType: types.pineShoot } }
  );

  try {
    api.events.on(
      "terrain:updated",
      (payload) => {
        const cell = cellFromArgs(payload);
        if (cell) collapseIfDetached(api, types, cell.x, cell.y);
      },
      { guard: { terrainType: types.pineWood } }
    );
  } catch {
    /* Main-thread terrain:destroyed still runs. */
  }
}
