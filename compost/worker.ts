import { cellFromArgs, xyFromValue } from "../shared/cell.ts";
import { queueWetCompostSettle } from "./queue.ts";
import { resetIdleTicks, tickIdleSettle, tryWetCompost, type WetTypes } from "./wet.ts";

function resetMoved(
  api: WorkerSandkitApi,
  elementType: number,
  args: Record<string, unknown>,
): void {
  const dest = xyFromValue(args.dest) ?? xyFromValue(args.target) ?? cellFromArgs(args);
  const source = xyFromValue(args.source);
  if (source) resetIdleTicks(api, elementType, source.x, source.y);
  if (dest) resetIdleTicks(api, elementType, dest.x, dest.y);
}

export function registerWorker(api: WorkerSandkitApi, types: WetTypes): void {
  api.hooks.intercept(
    "element:update",
    (args) => {
      const cell = cellFromArgs(args);
      if (!cell) return;
      tickIdleSettle(api, types.compost, cell.x, cell.y);
      tryWetCompost(api, types, cell.x, cell.y);
    },
    { guard: { elementType: types.compost } },
  );
  api.hooks.intercept("element:move", (args) => {
    if (args.elementType !== types.compost) return;
    resetMoved(api, types.compost, args);
  });

  api.hooks.intercept(
    "element:update",
    (args) => {
      const cell = cellFromArgs(args);
      if (!cell) return;
      if (tickIdleSettle(api, types.wetCompost, cell.x, cell.y, { randomDirtWait: true })) {
        queueWetCompostSettle(api, types.wetCompost, cell.x, cell.y);
      }
    },
    { guard: { elementType: types.wetCompost } },
  );
  api.hooks.intercept("element:move", (args) => {
    if (args.elementType !== types.wetCompost) return;
    resetMoved(api, types.wetCompost, args);
  });
}
