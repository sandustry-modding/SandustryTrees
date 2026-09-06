import { ELEMENT } from "../shared/ids.ts";
import { COMPOST_SETTLE_EVENT } from "./event.ts";
import { applyWetCompostSettle } from "./settle.ts";

const api = sandkit.api;

export function registerMain(): void {
  const wetCompost = api.elements.getTypeById(ELEMENT.wetCompost);
  api.events.on(COMPOST_SETTLE_EVENT, (payload) => {
    const record = payload as { cellX?: number; cellY?: number; x?: number; y?: number };
    const cellX = record.cellX ?? record.x;
    const cellY = record.cellY ?? record.y;
    if (typeof cellX !== "number" || typeof cellY !== "number") return;
    applyWetCompostSettle(api, wetCompost, cellX, cellY);
  });
}
