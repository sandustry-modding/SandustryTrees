import { COMPOST_SETTLE_EVENT } from "./event.ts";
import { convertWetCompostToDirt } from "./settle.ts";

export function queueWetCompostSettle(
  api: WorkerSandkitApi,
  wetCompost: number,
  cellX: number,
  cellY: number,
): void {
  if (!convertWetCompostToDirt(api, wetCompost, cellX, cellY)) return;
  api.main.emitEvent(COMPOST_SETTLE_EVENT, { cellX, cellY });
}
