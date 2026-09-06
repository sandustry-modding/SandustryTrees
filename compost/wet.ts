import type { Cell } from "../shared/cell.ts";
import { DIRS } from "../shared/dirs.ts";
import {
  DIRT_IDLE_BEFORE_RANDOM_TICKS,
  DIRT_SETTLE_MAX_TICKS,
  DIRT_SETTLE_MIN_TICKS,
  DIRT_WAIT_FIELD,
  IDLE_FIELD,
  SETTLE_DURATION_TICKS,
} from "./constants.ts";

export type WetTypes = {
  compost: number;
  wetCompost: number;
  water: number;
};

export function findAdjacentWater(
  isWater: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
): Cell | null {
  for (const [dx, dy] of DIRS) {
    const x = cellX + dx;
    const y = cellY + dy;
    if (isWater(x, y)) return { x, y };
  }
  return null;
}

export function isSupported(
  isCellEmpty: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
): boolean {
  return !isCellEmpty(cellX, cellY + 1);
}

/** True when powder can still fall or slide, so it is not at rest. */
export function canPowderMove(
  isCellEmpty: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
): boolean {
  if (isCellEmpty(cellX, cellY + 1)) return true;
  const slideLeft = isCellEmpty(cellX - 1, cellY) && isCellEmpty(cellX - 1, cellY + 1);
  const slideRight = isCellEmpty(cellX + 1, cellY) && isCellEmpty(cellX + 1, cellY + 1);
  return slideLeft || slideRight;
}

export function isSettled(
  isCellEmpty: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
): boolean {
  return !canPowderMove(isCellEmpty, cellX, cellY);
}

export function nextIdleTicks(current: number, settled: boolean): number {
  if (!settled) return 0;
  return current + 1;
}

export function shouldSettleTicks(ticks: number, needed: number): boolean {
  return ticks >= needed;
}

export function nextDirtWait(
  currentWait: number,
  settled: boolean,
  idleTicks: number,
  minIdle: number,
  rolled: number,
): number {
  if (!settled) return 0;
  if (currentWait > 0) return currentWait;
  if (idleTicks < minIdle) return 0;
  return rolled;
}

function cellSettled(api: WorkerSandkitApi, cellX: number, cellY: number): boolean {
  return isSettled((x, y) => api.grid.isCellEmptyAtCell(x, y), cellX, cellY);
}

export function tryWetCompost(
  api: WorkerSandkitApi,
  types: WetTypes,
  cellX: number,
  cellY: number,
): boolean {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.compost)) return false;
  const ticks = api.elements.getDataFieldAtCell(cellX, cellY, IDLE_FIELD) ?? 0;
  if (!shouldSettleTicks(ticks, SETTLE_DURATION_TICKS)) return false;
  if (!cellSettled(api, cellX, cellY)) return false;
  const water = findAdjacentWater(
    (x, y) => api.elements.isTypeAtCell(x, y, types.water),
    cellX,
    cellY,
  );
  if (!water) return false;
  api.elements.removeAtCell(water.x, water.y);
  api.elements.replaceAtCell(cellX, cellY, types.wetCompost, {
    dataFields: { field1: 0, field2: 0 },
  });
  api.grid.reportActivityAtCell(cellX, cellY);
  api.grid.reportActivityAtCell(water.x, water.y);
  return true;
}

export function resetIdleTicks(
  api: WorkerSandkitApi,
  elementType: number,
  cellX: number,
  cellY: number,
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, elementType)) return;
  const ticks = api.elements.getDataFieldAtCell(cellX, cellY, IDLE_FIELD) ?? 0;
  const wait = api.elements.getDataFieldAtCell(cellX, cellY, DIRT_WAIT_FIELD) ?? 0;
  if (ticks === 0 && wait === 0) return;
  api.elements.setDataFieldAtCell(cellX, cellY, IDLE_FIELD, 0);
  api.elements.setDataFieldAtCell(cellX, cellY, DIRT_WAIT_FIELD, 0);
}

export function tickIdleSettle(
  api: WorkerSandkitApi,
  elementType: number,
  cellX: number,
  cellY: number,
  options?: { randomDirtWait?: boolean },
): boolean {
  if (!api.elements.isTypeAtCell(cellX, cellY, elementType)) return false;
  const settled = cellSettled(api, cellX, cellY);
  const current = api.elements.getDataFieldAtCell(cellX, cellY, IDLE_FIELD) ?? 0;
  const ticks = nextIdleTicks(current, settled);
  let needed = SETTLE_DURATION_TICKS;
  if (options?.randomDirtWait) {
    const currentWait = api.elements.getDataFieldAtCell(cellX, cellY, DIRT_WAIT_FIELD) ?? 0;
    const wait = nextDirtWait(
      currentWait,
      settled,
      ticks,
      DIRT_IDLE_BEFORE_RANDOM_TICKS,
      api.random.int(DIRT_SETTLE_MIN_TICKS, DIRT_SETTLE_MAX_TICKS),
    );
    if (wait !== currentWait) {
      api.elements.setDataFieldAtCell(cellX, cellY, DIRT_WAIT_FIELD, wait);
    }
    needed = wait > 0 ? DIRT_IDLE_BEFORE_RANDOM_TICKS + wait : DIRT_IDLE_BEFORE_RANDOM_TICKS + 1;
  }
  if (ticks !== current) {
    api.elements.setDataFieldAtCell(cellX, cellY, IDLE_FIELD, ticks);
    api.grid.reportActivityAtCell(cellX, cellY);
  }
  return needed > 0 && shouldSettleTicks(ticks, needed);
}
