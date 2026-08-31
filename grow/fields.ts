import { FIELD } from "../shared/field.ts";
import type { TreeFields } from "../shared/types.ts";
import { PHASE, SEED_COUNT_MAX } from "./constants.ts";
import { halfWidthForSeedCount, storedSeedCount, targetHeightForSeedCount } from "./size.ts";

export function treeFields(api: WorkerSandkitApi, cellX: number, cellY: number): TreeFields {
  const stored = api.elements.getDataFieldAtCell(cellX, cellY, FIELD.phase) ?? 1;
  const seedCount = storedSeedCount(stored);
  const halfWidth = halfWidthForSeedCount(seedCount);
  return {
    rootX: api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootX) ?? cellX,
    rootY: api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootY) ?? cellY,
    progress: api.elements.getDataFieldAtCell(cellX, cellY, FIELD.trunkHeight) ?? 1,
    phase: stored > SEED_COUNT_MAX ? stored : PHASE.growingTrunk,
    seedCount,
    halfWidth,
    targetHeight: targetHeightForSeedCount(seedCount),
  };
}
