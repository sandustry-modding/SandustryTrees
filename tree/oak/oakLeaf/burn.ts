import type { Cell } from "../../../shared/cell.ts";
import { ORTHO8_DIRS } from "../../../shared/dirs.ts";
import { NEEDLE_BURN_RESIDUE_CHANCE, NEEDLE_IGNITE_CHANCE } from "./constants.ts";

export type LeafBurnTypes = {
  oakLeaf: number;
  fire: number;
  flame: number;
  burntResidue: number;
};

/** True when an ortho-8 neighbor is fire. */
export function touchesFire(
  isFire: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
): boolean {
  for (const [dx, dy] of ORTHO8_DIRS) {
    if (isFire(cellX + dx, cellY + dy)) return true;
  }
  return false;
}

export function shouldIgnite(roll: number, chance: number): boolean {
  return roll < chance;
}

/** Pick one ortho-8 leaf neighbor. */
export function pickLeafNeighbor(
  isLeaf: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
  roll: number,
): Cell | null {
  const candidates: Cell[] = [];
  for (const [dx, dy] of ORTHO8_DIRS) {
    const x = cellX + dx;
    const y = cellY + dy;
    if (!isLeaf(x, y)) continue;
    candidates.push({ x, y });
  }
  if (candidates.length === 0) return null;
  const index = Math.floor(roll * candidates.length) % candidates.length;
  return candidates[index] ?? null;
}

function lightLeaf(
  api: WorkerSandkitApi,
  types: LeafBurnTypes,
  cellX: number,
  cellY: number,
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.oakLeaf)) return;
  if (api.fire.burnElementAtCell(cellX, cellY)) return;
  api.elements.replaceAtCell(cellX, cellY, types.flame, {
    data: {
      output: { elementType: types.burntResidue, chance: NEEDLE_BURN_RESIDUE_CHANCE },
    },
  });
  api.grid.reportActivityAtCell(cellX, cellY);
}

/** Light one neighboring leaf slowly from this fire or flame cell. */
export function igniteLeavesTouchingFire(
  api: WorkerSandkitApi,
  types: LeafBurnTypes,
  cellX: number,
  cellY: number,
): void {
  if (!shouldIgnite(api.random.float(0, 1), NEEDLE_IGNITE_CHANCE)) return;
  const next = pickLeafNeighbor(
    (x, y) => api.elements.isTypeAtCell(x, y, types.oakLeaf),
    cellX,
    cellY,
    api.random.float(0, 1),
  );
  if (!next) return;
  lightLeaf(api, types, next.x, next.y);
}
