import { CANOPY_TIP_OFFSET_CELLS } from "../canopy/constants.ts";
import { canopyTipY } from "../canopy/shape.ts";
import { TRUNK_HALF_WIDTH_MAX, TRUNK_HEIGHT, TRUNK_HEIGHT_MAX } from "../grow/constants.ts";
import { canopyMaxHalfForHalfWidth, canopyRowsForHalfWidth } from "../grow/size.ts";
import { cellKey } from "../shared/cell.ts";
import { collectConnectedTrunkCells } from "./collapse.ts";

/** Vertical span to search for canopy needles around a mined trunk cell. */
const CANOPY_SEARCH =
  TRUNK_HEIGHT_MAX + canopyRowsForHalfWidth(TRUNK_HALF_WIDTH_MAX) + CANOPY_TIP_OFFSET_CELLS + 2;

/** Vertical span to search for remaining trunk cells after one cell is mined. */
const TRUNK_SEARCH = TRUNK_HEIGHT_MAX + 2;

const NEEDLE_SEARCH_HALF = canopyMaxHalfForHalfWidth(TRUNK_HALF_WIDTH_MAX);

export type LinkedNeedle = { x: number; y: number };

export type NeedleScanOps = {
  isPineWood: (cellX: number, cellY: number) => boolean;
  isNeedle: (cellX: number, cellY: number) => boolean;
  needleRootX: (cellX: number, cellY: number) => number;
  needleRootY: (cellX: number, cellY: number) => number;
};

function needleSet(needles: readonly LinkedNeedle[]): Set<string> {
  return new Set(needles.map((cell) => cellKey(cell.x, cell.y)));
}

function topmostNeedle(needles: readonly LinkedNeedle[], columnX?: number): LinkedNeedle | null {
  let best: LinkedNeedle | null = null;
  for (const cell of needles) {
    if (columnX !== undefined && cell.x !== columnX) continue;
    if (!best || cell.y < best.y || (cell.y === best.y && cell.x < best.x)) {
      best = cell;
    }
  }
  return best;
}

/** Needles linked to the trunk columns that collapse after one trunk cell is mined. */
export function collectLinkedNeedles(
  cellX: number,
  minedY: number,
  ops: NeedleScanOps,
): { linkedNeedles: LinkedNeedle[]; rootX: number; rootY: number } {
  const connected = collectConnectedTrunkCells(ops.isPineWood, cellX, minedY);
  const columnXs = new Set<number>([cellX]);
  for (const cell of connected) {
    columnXs.add(cell.x);
  }

  const top = minedY - CANOPY_SEARCH;
  const bottom = minedY + TRUNK_SEARCH;
  const left = Math.min(...columnXs) - NEEDLE_SEARCH_HALF;
  const right = Math.max(...columnXs) + NEEDLE_SEARCH_HALF;
  const linkedNeedles: LinkedNeedle[] = [];
  let rootX = cellX;
  let rootY = minedY;
  let hasRoot = false;

  for (let needleX = left; needleX <= right; needleX += 1) {
    for (let needleY = top; needleY <= bottom; needleY += 1) {
      if (!ops.isNeedle(needleX, needleY)) continue;
      if (!columnXs.has(ops.needleRootX(needleX, needleY))) continue;
      linkedNeedles.push({ x: needleX, y: needleY });
      if (!hasRoot) {
        rootX = ops.needleRootX(needleX, needleY);
        rootY = ops.needleRootY(needleX, needleY);
        hasRoot = true;
      }
    }
  }

  return { linkedNeedles, rootX, rootY };
}

/** Deterministic harvest seed slots: canopy tip, then center row below on bonus roll. */
export function resolveHarvestSeedSlots(
  rootX: number,
  rootY: number,
  linkedNeedles: readonly LinkedNeedle[],
  rollSecond: boolean,
): ReadonlySet<string> {
  if (linkedNeedles.length === 0) return new Set();

  const needles = needleSet(linkedNeedles);
  const tipY = canopyTipY(rootY, TRUNK_HEIGHT);
  const tipKey = cellKey(rootX, tipY);

  let primary: LinkedNeedle | null = needles.has(tipKey) ? { x: rootX, y: tipY } : null;
  if (!primary) primary = topmostNeedle(linkedNeedles, rootX);
  if (!primary) primary = topmostNeedle(linkedNeedles);
  if (!primary) return new Set();

  const slots = new Set<string>([cellKey(primary.x, primary.y)]);
  if (!rollSecond) return slots;

  const bonusKey = cellKey(rootX, primary.y + 1);
  if (needles.has(bonusKey) && bonusKey !== cellKey(primary.x, primary.y)) {
    slots.add(bonusKey);
  }
  return slots;
}

/** Seed needle slots for one trunk harvest collapse. */
export function harvestSeedSlotsForCollapse(
  cellX: number,
  minedY: number,
  ops: NeedleScanOps,
  rollSecond: boolean,
): ReadonlySet<string> {
  const { linkedNeedles, rootX, rootY } = collectLinkedNeedles(cellX, minedY, ops);
  return resolveHarvestSeedSlots(rootX, rootY, linkedNeedles, rollSecond);
}
