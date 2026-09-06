import type { Cell } from "../../../shared/cell.ts";
import { canopyDesiredCells } from "../oakLeaf/fill.ts";
import { CANOPY_SECOND_ACORN_CHANCE } from "./constants.ts";

export type CanopyAcornTypes = {
  oakLeaf: number;
  acorn: number;
};

export function shouldSpawnSecondAcorn(roll: number, chance: number): boolean {
  return roll < chance;
}

function pickIndex(count: number, roll: number): number {
  if (count <= 0) return 0;
  return Math.floor(roll * count) % count;
}

/** Pick one leaf cell, then a second cell when spawnSecond is true. */
export function pickCanopyAcornCells(
  leaves: readonly Cell[],
  firstRoll: number,
  spawnSecond: boolean,
  secondRoll: number,
): Cell[] {
  if (leaves.length === 0) return [];
  const firstIndex = pickIndex(leaves.length, firstRoll);
  const first = leaves[firstIndex];
  if (!first) return [];
  if (!spawnSecond || leaves.length < 2) return [first];
  const rest = leaves.filter((_, index) => index !== firstIndex);
  const second = rest[pickIndex(rest.length, secondRoll)];
  if (!second) return [first];
  return [first, second];
}

export function spawnCanopyAcorns(
  api: WorkerSandkitApi,
  types: CanopyAcornTypes,
  rootX: number,
  rootY: number,
  height: number,
): void {
  const leaves = canopyDesiredCells(rootX, rootY, height).filter((cell) =>
    api.elements.isTypeAtCell(cell.x, cell.y, types.oakLeaf),
  );
  const cells = pickCanopyAcornCells(
    leaves,
    api.random.float(0, 1),
    shouldSpawnSecondAcorn(api.random.float(0, 1), CANOPY_SECOND_ACORN_CHANCE),
    api.random.float(0, 1),
  );
  for (const cell of cells) {
    if (!api.elements.isTypeAtCell(cell.x, cell.y, types.oakLeaf)) continue;
    api.elements.replaceAtCell(cell.x, cell.y, types.acorn);
    api.grid.reportActivityAtCell(cell.x, cell.y);
  }
}
