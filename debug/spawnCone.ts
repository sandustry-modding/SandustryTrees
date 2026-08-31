import { ELEMENT } from "../shared/ids.ts";
import { modinfo } from "../modinfo.ts";

const api = sandkit.api;

const BINDING_SPAWN_CONE = `${modinfo.id}.spawnPineCone`;

export function registerSpawnCone(): void {
  api.input.registerBinding(BINDING_SPAWN_CONE, ["KeyH"], {
    displayName: "Spawn Pine Cone",
    category: modinfo.name,
    handlers: {
      up: () => {
        if (api.input.isCtrlHeld()) return;
        const cell = api.input.getMouseCellPosition();
        if (!api.grid.isCellEmptyAtCell(cell.x, cell.y)) return;
        api.elements.createAtCell(cell.x, cell.y, ELEMENT.pineCone);
        api.grid.reportActivityAtCell(cell.x, cell.y);
      }
    }
  });
}
