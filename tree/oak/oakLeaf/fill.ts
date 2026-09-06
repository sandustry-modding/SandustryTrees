import { config } from "../../../config.ts";
import type { Cell } from "../../../shared/cell.ts";

export type CanopyTypes = {
  oakLeaf: number;
  oakWood: number;
};

type LimbSpec = {
  originHeight: number;
  dirX: -1 | 1;
  steps: readonly (readonly [number, number])[];
};

function stair(dirX: -1 | 1, out: number, up: number): readonly (readonly [number, number])[] {
  const steps: [number, number][] = [];
  let gone = 0;
  let risen = 0;
  while (gone < out || risen < up) {
    if (gone < out) {
      steps.push([dirX, 0]);
      gone += 1;
    }
    if (risen < up) {
      steps.push([0, -1]);
      risen += 1;
    }
  }
  return steps;
}

/** 4-connected crown split. Diagonal steps detach and collapse into falling wood. */
function limbs(): readonly LimbSpec[] {
  const originHeight = config.oakTrunkForkHeight;
  const out = config.oakLimbOut;
  const up = config.oakLimbUp;
  return [
    { originHeight, dirX: -1, steps: stair(-1, out, up) },
    { originHeight, dirX: 1, steps: stair(1, out, up) },
  ];
}

type LeafGrid = {
  grid: {
    isCellEmptyAtCell(cellX: number, cellY: number): boolean;
    isTerrainAtCell(cellX: number, cellY: number): boolean;
  };
  elements: {
    getTypeAtCell(cellX: number, cellY: number): number | null;
  };
};

/** True when the cell has no terrain and no element. */
export function isVacantCell(api: LeafGrid, cellX: number, cellY: number): boolean {
  if (api.grid.isTerrainAtCell(cellX, cellY)) return false;
  if (api.elements.getTypeAtCell(cellX, cellY) != null) return false;
  return api.grid.isCellEmptyAtCell(cellX, cellY);
}

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}

function canopyGrowT(height: number): number {
  return Math.min(
    1,
    (height - config.oakCanopyMinTrunkHeight) /
      Math.max(1, config.oakTrunkHeight - config.oakCanopyMinTrunkHeight),
  );
}

function trunkTopY(rootY: number, height: number): number {
  return rootY - height + 1;
}

function thickenLimb(cells: readonly Cell[], dirX: -1 | 1): Cell[] {
  const seen = new Set<string>();
  const thick: Cell[] = [];
  for (const cell of cells) {
    for (const dx of [0, dirX]) {
      const next = { x: cell.x + dx, y: cell.y };
      const key = cellKey(next);
      if (seen.has(key)) continue;
      seen.add(key);
      thick.push(next);
    }
  }
  return thick;
}

function limbPolylines(rootX: number, rootY: number, height: number): Cell[][] {
  const topY = trunkTopY(rootY, height);
  const growing = height < config.oakTrunkHeight;
  const lines: Cell[][] = [];
  for (const limb of limbs()) {
    if (height <= limb.originHeight) continue;
    const t = Math.min(1, (height - limb.originHeight) / config.oakLimbGrowRows);
    const n = Math.max(1, Math.ceil(limb.steps.length * t));
    const cells: Cell[] = [];
    let x = rootX;
    let y = rootY - limb.originHeight;
    if (!growing || y >= topY) cells.push({ x, y });
    for (let i = 0; i < n; i += 1) {
      const step = limb.steps[i];
      if (!step) break;
      x += step[0];
      y += step[1];
      if (growing && y < topY) break;
      cells.push({ x, y });
    }
    if (cells.length > 0) lines.push(thickenLimb(cells, limb.dirX));
  }
  return lines;
}

/** Oak wood cells that fork out of the upper trunk. */
export function desiredBranchCells(rootX: number, rootY: number, height: number): Cell[] {
  if (height < config.oakCanopyMinTrunkHeight) return [];
  const seen = new Set<string>();
  const cells: Cell[] = [];
  for (const line of limbPolylines(rootX, rootY, height)) {
    for (const cell of line) {
      const key = cellKey(cell);
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push(cell);
    }
  }
  return cells;
}

function stampDisk(cells: Cell[], seen: Set<string>, cx: number, cy: number, radius: number): void {
  if (radius <= 0) return;
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const x = cx + dx;
      const y = cy + dy;
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push({ x, y });
    }
  }
}

/** Overlapping leaf clumps. Lower trunk stays bare so the bole reads. */
export function canopyDesiredCells(rootX: number, rootY: number, height: number): Cell[] {
  if (height < config.oakCanopyMinTrunkHeight) return [];
  const growing = height < config.oakTrunkHeight;
  const topY = trunkTopY(rootY, height);
  const peakY = growing ? topY - 1 : topY;
  const splitY = rootY - Math.min(height, config.oakTrunkForkHeight);
  const t = canopyGrowT(height);
  const tipR = 3 + Math.round(t * (config.oakLeafTipRadius - 3));
  const crownR = 4 + Math.round(t * (config.oakLeafCrownRadius - 4));
  const branches = desiredBranchCells(rootX, rootY, height);
  const branchKeys = new Set(branches.map(cellKey));
  const seen = new Set<string>();
  const cells: Cell[] = [];
  stampDisk(cells, seen, rootX, peakY, crownR);
  stampDisk(cells, seen, rootX, splitY, crownR);
  if (height > config.oakTrunkForkHeight) {
    const midY = Math.round((splitY + peakY) / 2);
    stampDisk(cells, seen, rootX, midY, crownR);
  }
  for (const line of limbPolylines(rootX, rootY, height)) {
    for (let i = 0; i < line.length; i += 1) {
      const cell = line[i];
      if (!cell) continue;
      const distFromTip = line.length - 1 - i;
      const radius = distFromTip === 0 ? tipR : Math.max(3, tipR - Math.min(3, distFromTip));
      stampDisk(cells, seen, cell.x, cell.y, radius);
    }
  }
  return cells.filter((cell) => {
    if (growing && cell.x === rootX && cell.y === peakY) return false;
    if (branchKeys.has(cellKey(cell))) return false;
    if (
      Math.abs(cell.x - rootX) <= config.oakTrunkHalfWidth &&
      cell.y > splitY + config.oakCanopyLead
    ) {
      return false;
    }
    return true;
  });
}

export function fillCanopy(
  api: WorkerSandkitApi,
  types: CanopyTypes,
  rootX: number,
  rootY: number,
  height: number,
  previousHeight = 0,
): void {
  if (height < config.oakCanopyMinTrunkHeight) return;
  const desired = canopyDesiredCells(rootX, rootY, height);
  const previous =
    previousHeight > 0 && previousHeight < height
      ? canopyDesiredCells(rootX, rootY, previousHeight)
      : [];
  const desiredKeys = new Set(desired.map(cellKey));
  const previousKeys = new Set(previous.map(cellKey));
  for (const cell of previous) {
    if (desiredKeys.has(cellKey(cell))) continue;
    if (!api.elements.isTypeAtCell(cell.x, cell.y, types.oakLeaf)) continue;
    api.elements.removeAtCell(cell.x, cell.y);
  }
  for (const cell of desired) {
    if (previousKeys.has(cellKey(cell))) continue;
    if (!isVacantCell(api, cell.x, cell.y)) continue;
    api.elements.createAtCell(cell.x, cell.y, types.oakLeaf);
  }
}
