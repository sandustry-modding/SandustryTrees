import { ELEMENT } from "../shared/ids.ts";

const api = sandkit.api;

function isGrabberUse(itemId: string | number): boolean {
  const grabber = sandkit.enums.ItemId.Grabber;
  return itemId === grabber || itemId === String(grabber);
}

export function registerMain(): void {
  const needle = api.elements.getTypeById(ELEMENT.pineNeedle);
  api.hooks.intercept("item:use", (args) => {
    if (!isGrabberUse(args.itemId)) return;
    if (api.tools.grabber.isLoaded()) return;
    const origin = api.input.getMouseCellPosition();
    const size = api.tools.grabber.getSize();
    const half = Math.floor(size / 2);
    api.grid.mutate((writer) => {
      for (let dy = -half; dy <= half; dy += 1) {
        for (let dx = -half; dx <= half; dx += 1) {
          const cellX = origin.x + dx;
          const cellY = origin.y + dy;
          if (!api.elements.isTypeAtCell(cellX, cellY, needle)) continue;
          writer.elements.replaceAtCell(cellX, cellY, ELEMENT.leafDust, {
            isFreeFalling: true,
          });
          api.grid.reportActivityAtCell(cellX, cellY);
        }
      }
    });
  });
}
