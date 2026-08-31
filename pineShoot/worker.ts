import { growPineShoot, type GrowTypes } from "./grow.ts";
import { collapseIfDetached, type HarvestTypes } from "../pineWood/collapse.ts";
import { cellFromArgs } from "../shared/cell.ts";

type ShootTypes = GrowTypes & HarvestTypes;

export function registerWorker(api: WorkerSandkitApi, types: ShootTypes): void {
  const onDuration = (args: Record<string, unknown>, context: { cancel(): void }) => {
    const cell = cellFromArgs(args);
    if (!cell) return;
    growPineShoot(api, types, cell.x, cell.y);
    collapseIfDetached(api, types, cell.x, cell.y);
    context.cancel();
  };

  api.hooks.intercept("element:duration", (args, context) => {
    onDuration(args, context);
  }, { guard: { elementType: types.pineShoot } });

  api.hooks.intercept("element:duration:expire", (args, context) => {
    onDuration(args, context);
  }, { guard: { elementType: types.pineShoot } });

  api.hooks.intercept(
    "element:update",
    (args) => {
      const cell = cellFromArgs(args);
      if (cell) collapseIfDetached(api, types, cell.x, cell.y);
    },
    { guard: { elementType: types.pineShoot } }
  );
}
