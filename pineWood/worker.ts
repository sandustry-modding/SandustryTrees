import { collapseIfDetached, type HarvestTypes } from "./collapse.ts";
import { cellFromArgs } from "../shared/cell.ts";

export function registerWorker(api: WorkerSandkitApi, types: HarvestTypes): void {
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
