import { countAdjacentAir } from "./air.ts";
import {
  CARDINAL_DIRS,
  FIELD,
  PHYSICS_SKIP,
  WOOD_FLAME_DURATION_SEC,
  WOOD_SPREAD_DELAY_TICKS,
} from "./constants.ts";
import type { TreeTypes } from "./types.ts";

export type Cell = { x: number; y: number };

const WOOD_DENSITY = 120;

/** Pick one cardinal Raw Wood neighbor to light next. */
export function pickSpreadNeighbor(
  isRawWood: (cellX: number, cellY: number) => boolean,
  isPrimed: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
  roll: number,
): Cell | null {
  const candidates: Cell[] = [];
  for (const [dx, dy] of CARDINAL_DIRS) {
    const x = cellX + dx;
    const y = cellY + dy;
    if (!isRawWood(x, y)) continue;
    if (isPrimed(x, y)) continue;
    candidates.push({ x, y });
  }
  if (candidates.length === 0) return null;
  const index = Math.floor(roll * candidates.length) % candidates.length;
  return candidates[index] ?? null;
}

function isIgnitePrimed(api: WorkerSandkitApi, cellX: number, cellY: number): boolean {
  return (api.elements.getDataFieldAtCell(cellX, cellY, FIELD.ignitePrime) ?? 0) === 1;
}

function isSealed(api: WorkerSandkitApi, cellX: number, cellY: number): boolean {
  return countAdjacentAir((x, y) => api.grid.isCellEmptyAtCell(x, y), cellX, cellY) === 0;
}

/** Static Flame that becomes Charcoal after WOOD_FLAME_DURATION_SEC. */
export function lightCharcoalFlame(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
): void {
  const duration = WOOD_FLAME_DURATION_SEC[0];
  api.elements.replaceAtCell(cellX, cellY, types.flame, {
    density: WOOD_DENSITY,
    duration,
    data: {
      output: { elementType: types.charcoal, chance: 1 },
    },
  });
  api.elements.setPhysicsAtCell(cellX, cellY, PHYSICS_SKIP);
  api.grid.reportActivityAtCell(cellX, cellY);
}

/** After sealed Raw Wood ignites, schedule one sealed neighbor so the fire crawls. */
export function primeNeighborIgnition(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
): void {
  const next = pickSpreadNeighbor(
    (x, y) => api.elements.isTypeAtCell(x, y, types.rawWood) && isSealed(api, x, y),
    (x, y) => isIgnitePrimed(api, x, y),
    cellX,
    cellY,
    Math.random(),
  );
  if (!next) return;
  api.elements.setDataFieldAtCell(next.x, next.y, FIELD.ignitePrime, 1);
  api.elements.setDurationAtCell(next.x, next.y, WOOD_SPREAD_DELAY_TICKS, { updateMax: true });
  api.grid.reportActivityAtCell(next.x, next.y);
}

/**
 * Open air: let vanilla burn to burnt residue.
 * Sealed: static charcoal flame + crawl to sealed neighbors.
 */
export function burnRawWood(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  context: { cancel(): void },
): void {
  if (!isSealed(api, cellX, cellY)) return;
  context.cancel();
  lightCharcoalFlame(api, types, cellX, cellY);
  primeNeighborIgnition(api, types, cellX, cellY);
}

/** When a primed Raw Wood timer ends, light it. */
export function ignitePrimedRawWood(
  api: WorkerSandkitApi,
  types: TreeTypes,
  cellX: number,
  cellY: number,
  context: { cancel(): void },
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.rawWood)) return;
  if (!isIgnitePrimed(api, cellX, cellY)) return;
  context.cancel();
  api.elements.setDataFieldAtCell(cellX, cellY, FIELD.ignitePrime, 0);
  api.fire.burnElementAtCell(cellX, cellY);
}
