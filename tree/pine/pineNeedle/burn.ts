import { config } from "../../../config.ts";
import type { Cell } from "../../../shared/cell.ts";
import { ORTHO8_DIRS } from "../../../shared/dirs.ts";

export type NeedleBurnTypes = {
  pineNeedle: number;
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

/** Pick one ortho-8 needle neighbor. */
export function pickNeedleNeighbor(
  isNeedle: (cellX: number, cellY: number) => boolean,
  cellX: number,
  cellY: number,
  roll: number,
): Cell | null {
  const candidates: Cell[] = [];
  for (const [dx, dy] of ORTHO8_DIRS) {
    const x = cellX + dx;
    const y = cellY + dy;
    if (!isNeedle(x, y)) continue;
    candidates.push({ x, y });
  }
  if (candidates.length === 0) return null;
  const index = Math.floor(roll * candidates.length) % candidates.length;
  return candidates[index] ?? null;
}

function lightNeedle(
  api: WorkerSandkitApi,
  types: NeedleBurnTypes,
  cellX: number,
  cellY: number,
): void {
  if (!api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle)) return;
  if (api.fire.burnElementAtCell(cellX, cellY)) return;
  api.elements.replaceAtCell(cellX, cellY, types.flame, {
    data: {
      output: { elementType: types.burntResidue, chance: config.pineNeedleBurnResidueChance },
    },
  });
  api.grid.reportActivityAtCell(cellX, cellY);
}

/** Light one neighboring needle slowly from this fire or flame cell. */
export function igniteNeedlesTouchingFire(
  api: WorkerSandkitApi,
  types: NeedleBurnTypes,
  cellX: number,
  cellY: number,
): void {
  if (!shouldIgnite(api.random.float(0, 1), config.pineNeedleIgniteChance)) return;
  const next = pickNeedleNeighbor(
    (x, y) => api.elements.isTypeAtCell(x, y, types.pineNeedle),
    cellX,
    cellY,
    api.random.float(0, 1),
  );
  if (!next) return;
  lightNeedle(api, types, next.x, next.y);
}
