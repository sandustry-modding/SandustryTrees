import type { Cell } from "../../../shared/cell.ts";
import { canopyDesiredCells } from "../pineNeedle/fill.ts";
import { CANOPY_SECOND_CONE_CHANCE } from "./constants.ts";

export type CanopyConeTypes = {
  pineNeedle: number;
  pineCone: number;
};

export function shouldSpawnSecondCone(roll: number, chance: number): boolean {
  return roll < chance;
}

function pickIndex(count: number, roll: number): number {
  if (count <= 0) return 0;
  return Math.floor(roll * count) % count;
}

/** Pick one needle cell, then a second cell when spawnSecond is true. */
export function pickCanopyConeCells(
  needles: readonly Cell[],
  firstRoll: number,
  spawnSecond: boolean,
  secondRoll: number,
): Cell[] {
  if (needles.length === 0) return [];
  const firstIndex = pickIndex(needles.length, firstRoll);
  const first = needles[firstIndex];
  if (!first) return [];
  if (!spawnSecond || needles.length < 2) return [first];
  const rest = needles.filter((_, index) => index !== firstIndex);
  const second = rest[pickIndex(rest.length, secondRoll)];
  if (!second) return [first];
  return [first, second];
}

export function spawnCanopyCones(
  api: WorkerSandkitApi,
  types: CanopyConeTypes,
  rootX: number,
  woodY: number,
  height: number,
): void {
  const needles = canopyDesiredCells(rootX, woodY, height).filter((cell) =>
    api.elements.isTypeAtCell(cell.x, cell.y, types.pineNeedle),
  );
  const cells = pickCanopyConeCells(
    needles,
    api.random.float(0, 1),
    shouldSpawnSecondCone(api.random.float(0, 1), CANOPY_SECOND_CONE_CHANCE),
    api.random.float(0, 1),
  );
  for (const cell of cells) {
    if (!api.elements.isTypeAtCell(cell.x, cell.y, types.pineNeedle)) continue;
    api.elements.replaceAtCell(cell.x, cell.y, types.pineCone);
    api.grid.reportActivityAtCell(cell.x, cell.y);
  }
}
