import { ELEMENT } from "../shared/ids.ts";

const api = sandkit.api;

function isGrabberUse(itemId: string | number): boolean {
  const grabber = sandkit.enums.ItemId.Grabber;
  return itemId === grabber || itemId === String(grabber);
}

export function registerGrabShoot(): void {
  const shoot = api.elements.getTypeById(ELEMENT.pineShoot);
  const cone = api.elements.getTypeById(ELEMENT.pineCone);
  api.hooks.intercept("item:use", (args) => {
    if (!isGrabberUse(args.itemId)) return;
    const origin = api.input.getMouseCellPosition();
    const size = api.tools.grabber.getSize();
    const half = Math.floor(size / 2);
    const grabCone = api.elements.isTypeAtCell(origin.x, origin.y, cone);
    for (let dy = -half; dy <= half; dy += 1) {
      for (let dx = -half; dx <= half; dx += 1) {
        const cellX = origin.x + dx;
        const cellY = origin.y + dy;
        const isShoot = api.elements.isTypeAtCell(cellX, cellY, shoot);
        const isCone = grabCone && api.elements.isTypeAtCell(cellX, cellY, cone);
        if (!isShoot && !isCone) continue;
        api.elements.replaceAtCell(cellX, cellY, ELEMENT.wood);
        api.grid.reportActivityAtCell(cellX, cellY);
      }
    }
  });
}
