import { config } from "../config.ts";
import type { Cell } from "../shared/cell.ts";
import { CARDINAL_DIRS } from "../shared/dirs.ts";
import { countAdjacentAir } from "./air.ts";
import { IGNITE_PRIME_FIELD, PHYSICS_SKIP } from "./constants.ts";

export type BurnTypes = {
  wood: number;
  charcoal: number;
  flame: number;
};

/** Pick one cardinal Wood neighbor to light next. */
export function pickSpreadNeighbor(
  isWood: (cellX: number, cellY: number) => boolean,
  isPrimed: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
  roll: number,
): Cell | null {
  const candidates: Cell[] = [];
  for (const [dx, dy] of CARDINAL_DIRS) {
    const x = cellX + dx;
    const y = cellY + dy;
    if (!isWood(x, y)) continue;
    if (isPrimed(x, y)) continue;
    candidates.push({ x, y });
  }
  if (candidates.length === 0) return null;
  const index = Math.floor(roll * candidates.length) % candidates.length;
  return candidates[index] ?? null;
}

function isIgnitePrimed(api: WorkerSandkitApi, cellX: number, cellY: number): boolean {
  return (api.elements.getDataFieldAtCell(cellX, cellY, IGNITE_PRIME_FIELD) ?? 0) === 1;
}

function isSealed(api: WorkerSandkitApi, cellX: number, cellY: number): boolean {
  return countAdjacentAir((x, y) => api.grid.isCellEmptyAtCell(x, y), cellX, cellY) === 0;
}

/** Static Flame that becomes Charcoal after `config.woodFlameDurationSec`. */
export function lightCharcoalFlame(
  api: WorkerSandkitApi,
  types: BurnTypes,
  cellX: number,
  cellY: number,
): void {
  const duration = config.woodFlameDurationSec;
  api.elements.replaceAtCell(cellX, cellY, types.flame, {
    density: config.woodDensity,
    duration,
    data: {
      output: { elementType: types.charcoal, chance: 1 },
    },
  });
  api.elements.setPhysicsAtCell(cellX, cellY, PHYSICS_SKIP);
  api.grid.reportActivityAtCell(cellX, cellY);
}

/** After sealed Wood ignites, schedule one sealed neighbor so the fire crawls. */
export function primeNeighborIgnition(
  api: WorkerSandkitApi,
  types: BurnTypes,
  cellX: number,
  cellY: number,
): void {
  const next = pickSpreadNeighbor(
    (x, y) => api.elements.isTypeAtCell(x, y, types.wood) && isSealed(api, x, y),
    (x, y) => isIgnitePrimed(api, x, y),
    cellX,
    cellY,
    Math.random(),
  );
  if (!next) return;
  api.elements.setDataFieldAtCell(next.x, next.y, IGNITE_PRIME_FIELD, 1);
  api.elements.setDurationAtCell(next.x, next.y, config.woodSpreadDelayTicks, { updateMax: true });
  api.grid.reportActivityAtCell(next.x, next.y);
}

/**
 * Open air: let vanilla burn to burnt residue.
 * Sealed: static charcoal flame + crawl to sealed neighbors.
 */
export function burnWood(
  api: WorkerSandkitApi,
  types: BurnTypes,
  cellX: number,
  cellY: number,
  context: { cancel(): void },
): void {
  if (!isSealed(api, cellX, cellY)) return;
  context.cancel();
  lightCharcoalFlame(api, types, cellX, cellY);
  primeNeighborIgnition(api, types, cellX, cellY);
}

/** When a primed Wood timer ends, light it. */
export function ignitePrimedWood(
  api: WorkerSandkitApi,
  types: BurnTypes,
  cellX: number,
  cellY: number,
  context: { cancel(): void },
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.wood)) return;
  if (!isIgnitePrimed(api, cellX, cellY)) return;
  context.cancel();
  api.elements.setDataFieldAtCell(cellX, cellY, IGNITE_PRIME_FIELD, 0);
  api.fire.burnElementAtCell(cellX, cellY);
}
