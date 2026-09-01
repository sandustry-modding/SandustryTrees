import { burnWood, ignitePrimedWood, type BurnTypes } from "./burn.ts";
import { cellFromArgs } from "../shared/cell.ts";

export function registerWorker(api: WorkerSandkitApi, types: BurnTypes): void {
  api.hooks.intercept("fire:element:burn", (args, context) => {
    const record = args as Record<string, unknown>;
    if (record.elementType !== types.wood) return;
    const cell = cellFromArgs(record);
    if (!cell) return;
    burnWood(api, types, cell.x, cell.y, context);
  });

  api.hooks.intercept(
    "element:duration:expire",
    (args, context) => {
      const cell = cellFromArgs(args);
      if (!cell) return;
      ignitePrimedWood(api, types, cell.x, cell.y, context);
    },
    { guard: { elementType: types.wood } },
  );
}
