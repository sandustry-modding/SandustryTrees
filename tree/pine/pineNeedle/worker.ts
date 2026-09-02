import { igniteNeedlesTouchingFire, type NeedleBurnTypes } from "./burn.ts";
import { cellFromArgs } from "../../../shared/cell.ts";

export function registerWorker(api: WorkerSandkitApi, types: NeedleBurnTypes): void {
  const igniteFromFire = (args: Record<string, unknown>) => {
    const cell = cellFromArgs(args);
    if (!cell) return;
    igniteNeedlesTouchingFire(api, types, cell.x, cell.y);
  };

  api.hooks.intercept("element:update", igniteFromFire, {
    guard: { elementType: types.fire },
  });
  api.hooks.intercept("element:update", igniteFromFire, {
    guard: { elementType: types.flame },
  });
}
