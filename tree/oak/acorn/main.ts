import { ELEMENT } from "../../../shared/ids.ts";

const api = sandkit.api;

function isGrabberUse(itemId: string | number): boolean {
  const grabber = sandkit.enums.ItemId.Grabber;
  return itemId === grabber || itemId === String(grabber);
}

export function registerMain(): void {
  const acorn = api.elements.getTypeById(ELEMENT.acorn);
  api.hooks.intercept("item:use", (args) => {
    if (!isGrabberUse(args.itemId)) return;
    const origin = api.input.getMouseCellPosition();
    if (!api.elements.isTypeAtCell(origin.x, origin.y, acorn)) return;
    const size = api.tools.grabber.getSize();
    const half = Math.floor(size / 2);
    for (let dy = -half; dy <= half; dy += 1) {
      for (let dx = -half; dx <= half; dx += 1) {
        const cellX = origin.x + dx;
        const cellY = origin.y + dy;
        if (!api.elements.isTypeAtCell(cellX, cellY, acorn)) continue;
        api.elements.replaceAtCell(cellX, cellY, ELEMENT.wood);
        api.grid.reportActivityAtCell(cellX, cellY);
      }
    }
  });
}
