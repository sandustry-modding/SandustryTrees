import { GROW_DURATION_TICKS, TRUNK_HALF_WIDTH } from "../grow/constants.ts";
import { placeTrunkRow } from "../grow/place.ts";
import {
  cellFromArgs,
  collidedAtFromArgs,
  destinationFromArgs,
  sourceFromArgs,
} from "../shared/cell.ts";
import type { TreeTypes } from "../shared/types.ts";
import { tryMergeSeedIntoNearbyTree } from "./merge.ts";
import { cardinalNeighbors, preferSupportCell } from "./support.ts";
import { initialAbsorbProgress } from "./wait.ts";

export function plantSeedOnWetSand(
  api: WorkerSandkitApi,
  types: TreeTypes,
  seedX: number,
  seedY: number,
  wetX: number,
  wetY: number,
): boolean {
  if (!api.elements.isTypeAtCell(seedX, seedY, types.pineSeed)) return false;
  if (!api.elements.isTypeAtCell(wetX, wetY, types.wetSand)) return false;
  if (tryMergeSeedIntoNearbyTree(api, types, seedX, seedY, wetX, wetY)) {
    return true;
  }
  api.elements.removeAtCell(seedX, seedY);
  placeTrunkRow(api, types, seedX, seedY, TRUNK_HALF_WIDTH);
  const shootY = seedY - 1;
  if (api.grid.isCellEmptyAtCell(seedX, shootY)) {
    api.elements.createAtCell(seedX, shootY, types.pineShoot, {
      durationTicks: GROW_DURATION_TICKS,
      dataFields: {
        field1: seedX,
        field2: seedY,
        field3: initialAbsorbProgress(),
        field4: 1,
      },
    });
    api.grid.reportActivityAtCell(seedX, shootY);
  }
  api.grid.reportActivityAtCell(seedX, seedY);
  api.grid.reportActivityAtCell(wetX, wetY);
  return true;
}

function tryPlantSeedTouchingWetSand(
  api: WorkerSandkitApi,
  types: TreeTypes,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): boolean {
  if (plantSeedOnWetSand(api, types, ax, ay, bx, by)) return true;
  return plantSeedOnWetSand(api, types, bx, by, ax, ay);
}

export function plantPineSeedFromBlocked(
  api: WorkerSandkitApi,
  types: TreeTypes,
  args: Record<string, unknown>,
  context: { cancel(): void },
): void {
  const seed = cellFromArgs(args);
  const hit = collidedAtFromArgs(args);
  if (!seed || !hit) return;
  if (!tryPlantSeedTouchingWetSand(api, types, seed.x, seed.y, hit.x, hit.y)) return;
  context.cancel();
}

export function plantPineSeedFromMove(
  api: WorkerSandkitApi,
  types: TreeTypes,
  args: Record<string, unknown>,
  context: { cancel(): void },
): void {
  const seed = sourceFromArgs(args);
  const dest = destinationFromArgs(args);
  if (!seed || !dest) return;
  if (!tryPlantSeedTouchingWetSand(api, types, seed.x, seed.y, dest.x, dest.y)) return;
  context.cancel();
}

export function plantPineSeedFromUpdate(
  api: WorkerSandkitApi,
  types: TreeTypes,
  args: Record<string, unknown>,
): void {
  const seed = cellFromArgs(args);
  if (!seed) return;
  const wet = preferSupportCell(
    seed,
    cardinalNeighbors(seed.x, seed.y).filter((cell) =>
      api.elements.isTypeAtCell(cell.x, cell.y, types.wetSand),
    ),
  );
  if (!wet) return;
  plantSeedOnWetSand(api, types, seed.x, seed.y, wet.x, wet.y);
}
