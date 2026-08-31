import { ELEMENT } from "../shared/ids.ts";

const api = sandkit.api;

function isGrabberUse(itemId: string | number): boolean {
  const grabber = sandkit.enums.ItemId.Grabber;
  return itemId === grabber || itemId === String(grabber);
}

export function registerGrabShoot(): void {
  const shoot = api.elements.getTypeById(ELEMENT.pineShoot);
  api.hooks.intercept("item:use", (args) => {
    if (!isGrabberUse(args.itemId)) return;
    const cell = api.input.getMouseCellPosition();
    if (!api.elements.isTypeAtCell(cell.x, cell.y, shoot)) return;
    api.elements.replaceAtCell(cell.x, cell.y, ELEMENT.wood);
    api.grid.reportActivityAtCell(cell.x, cell.y);
  });
}
