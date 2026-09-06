import { collapseIfDetached, type HarvestTypes } from "./collapse.ts";
import { cellFromArgs } from "../../../shared/cell.ts";
import { queueOakWoodShadows } from "./shadows.ts";

export function registerWorker(api: WorkerSandkitApi, types: HarvestTypes): void {
  try {
    api.events.on(
      "terrain:updated",
      (payload) => {
        const cell = cellFromArgs(payload);
        if (!cell) return;
        // Creates (growth) still have oak wood here. Harvest only after the cell is gone.
        if (api.terrains.getTypeAtCell(cell.x, cell.y) === types.oakWood) return;
        collapseIfDetached(api, types, cell.x, cell.y);
        queueOakWoodShadows(api, cell.x, cell.y);
      },
      { guard: { terrainType: types.oakWood } },
    );
  } catch {
    /* Main-thread terrain:destroyed still runs. */
  }
}
