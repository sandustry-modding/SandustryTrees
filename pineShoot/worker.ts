import { growPineShoot, type GrowTypes } from "./grow.ts";
import { cellFromArgs } from "../shared/cell.ts";

export function registerWorker(api: WorkerSandkitApi, types: GrowTypes): void {
  const onDuration = (args: Record<string, unknown>, context: { cancel(): void }) => {
    const cell = cellFromArgs(args);
    if (!cell) return;
    growPineShoot(api, types, cell.x, cell.y);
    context.cancel();
  };

  api.hooks.intercept(
    "element:duration",
    (args, context) => {
      onDuration(args, context);
    },
    { guard: { elementType: types.pineShoot } },
  );

  api.hooks.intercept(
    "element:duration:expire",
    (args, context) => {
      onDuration(args, context);
    },
    { guard: { elementType: types.pineShoot } },
  );
}
