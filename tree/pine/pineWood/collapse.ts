import { config } from "../../../config.ts";

export type HarvestTypes = {
  pineWood: number;
  pineNeedle: number;
  pineShoot: number;
  pineCone: number;
  wood: number;
  compost: number;
};

type Cell = { x: number; y: number };

/** Main-thread terrain:destroyed still reads the chopped cell as trunk until mutate applies. */
export type CollapseOptions = {
  omitCell?: Cell;
};

type TreeApi = {
  terrains: {
    getTypeAtCell(cellX: number, cellY: number): number | null;
    removeAtCell(cellX: number, cellY: number): void;
  };
  elements: {
    isTypeAtCell(cellX: number, cellY: number, elementType: number): boolean;
    createAtCell(
      cellX: number,
      cellY: number,
      elementType: number,
      options?: { isFreeFalling?: boolean },
    ): void;
    replaceAtCell(
      cellX: number,
      cellY: number,
      elementType: number,
      options?: { isFreeFalling?: boolean },
    ): void;
  };
  grid: { reportActivityAtCell(cellX: number, cellY: number): void };
};

type DropWriter = {
  terrains: { removeAtCell(cellX: number, cellY: number): void };
  elements: {
    createAtCell(
      cellX: number,
      cellY: number,
      elementType: number,
      options?: { isFreeFalling?: boolean },
    ): void;
    replaceAtCell(
      cellX: number,
      cellY: number,
      elementType: number,
      options?: { isFreeFalling?: boolean },
    ): void;
  };
};

const DIRS: readonly [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

const MAX_CELLS = 4096;

let collapsing = false;

const pendingCollapses = new Set<string>();

function queueCollapseOrigin(cellX: number, cellY: number): void {
  pendingCollapses.add(`${cellX},${cellY}`);
}

/** Pop the next queued collapse origin, if any. */
export function hasPendingCollapses(): boolean {
  return pendingCollapses.size > 0;
}

/** Pop the next queued collapse origin, if any. */
export function takePendingCollapseOrigin(): Cell | null {
  const key = pendingCollapses.values().next().value;
  if (!key) return null;
  pendingCollapses.delete(key);
  const [cellX, cellY] = key.split(",").map(Number);
  return { x: cellX, y: cellY };
}

/** Continue a partial trunk collapse on later ticks. */
export function drainPendingCollapses(
  api: TreeApi,
  types: HarvestTypes,
  writer: DropWriter = api,
): void {
  if (pendingCollapses.size === 0) return;
  const keys = [...pendingCollapses];
  pendingCollapses.clear();
  for (const key of keys) {
    const [cellX, cellY] = key.split(",").map(Number);
    collapseIfDetached(api, types, cellX, cellY, writer);
  }
}

/** Run work without harvest collapse (pine-wood creates during growth). */
export function runWithoutCollapse(work: () => void): void {
  if (collapsing) {
    work();
    return;
  }
  collapsing = true;
  try {
    work();
  } finally {
    collapsing = false;
  }
}

function isTrunkCell(
  api: TreeApi,
  types: HarvestTypes,
  cellX: number,
  cellY: number,
  omitCell?: Cell,
): boolean {
  if (omitCell?.x === cellX && omitCell?.y === cellY) return false;
  if (api.terrains.getTypeAtCell(cellX, cellY) === types.pineWood) return true;
  return api.elements.isTypeAtCell(cellX, cellY, types.pineShoot);
}

function isTreeCell(
  api: TreeApi,
  types: HarvestTypes,
  cellX: number,
  cellY: number,
  omitCell?: Cell,
): boolean {
  if (isTrunkCell(api, types, cellX, cellY, omitCell)) return true;
  return api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle);
}

function touchesDirt(api: TreeApi, cellX: number, cellY: number): boolean {
  return DIRS.some(
    ([dx, dy]) =>
      api.terrains.getTypeAtCell(cellX + dx, cellY + dy) === sandkit.enums.CellType.Dirt,
  );
}

function flood(
  api: TreeApi,
  types: HarvestTypes,
  start: Cell,
  seen: Set<string>,
  trunkOnly: boolean,
  omitCell?: Cell,
): Cell[] {
  const cells: Cell[] = [];
  const queue: Cell[] = [start];
  while (queue.length > 0 && cells.length < MAX_CELLS) {
    const cell = queue.pop();
    if (!cell) break;
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    const keep = trunkOnly
      ? isTrunkCell(api, types, cell.x, cell.y, omitCell)
      : isTreeCell(api, types, cell.x, cell.y, omitCell);
    if (!keep) continue;
    seen.add(key);
    cells.push(cell);
    if (trunkOnly && touchesDirt(api, cell.x, cell.y)) return cells;
    for (const [dx, dy] of DIRS) {
      queue.push({ x: cell.x + dx, y: cell.y + dy });
    }
  }
  return cells;
}

function dropCell(api: TreeApi, types: HarvestTypes, cell: Cell, writer: DropWriter): void {
  const fall = { isFreeFalling: true };
  if (api.terrains.getTypeAtCell(cell.x, cell.y) === types.pineWood) {
    writer.terrains.removeAtCell(cell.x, cell.y);
    writer.elements.createAtCell(cell.x, cell.y, types.wood, fall);
  } else if (api.elements.isTypeAtCell(cell.x, cell.y, types.pineNeedle)) {
    writer.elements.replaceAtCell(cell.x, cell.y, types.compost, fall);
  } else if (api.elements.isTypeAtCell(cell.x, cell.y, types.pineShoot)) {
    writer.elements.replaceAtCell(cell.x, cell.y, types.wood, fall);
  }
  api.grid.reportActivityAtCell(cell.x, cell.y);
}

function dropOrphans(api: TreeApi, types: HarvestTypes, cells: Cell[], writer: DropWriter): void {
  const remainingWood = cells.filter(
    (cell) => api.terrains.getTypeAtCell(cell.x, cell.y) === types.pineWood,
  );
  if (remainingWood.length === 0) {
    for (const cell of cells) dropCell(api, types, cell, writer);
    return;
  }
  const reachable = new Set<string>();
  const seen = new Set<string>();
  for (const start of remainingWood) {
    if (seen.has(`${start.x},${start.y}`)) continue;
    for (const cell of flood(api, types, start, seen, false, undefined)) {
      reachable.add(`${cell.x},${cell.y}`);
    }
  }
  for (const cell of cells) {
    if (reachable.has(`${cell.x},${cell.y}`)) continue;
    dropCell(api, types, cell, writer);
  }
}

function collapseComponent(
  api: TreeApi,
  types: HarvestTypes,
  cells: Cell[],
  writer: DropWriter,
  origin: Cell,
): void {
  const wood = cells.filter(
    (cell) => api.terrains.getTypeAtCell(cell.x, cell.y) === types.pineWood,
  );
  if (wood.length === 0) {
    for (const cell of cells) dropCell(api, types, cell, writer);
    return;
  }
  wood.sort((a, b) => b.y - a.y || a.x - b.x);
  const batchLimit = writer === api ? config.pineWoodCollapsePerTick : wood.length;
  const limit = Math.min(batchLimit, wood.length);
  for (let i = 0; i < limit; i += 1) dropCell(api, types, wood[i], writer);
  dropOrphans(api, types, cells, writer);
  if (batchLimit < wood.length) queueCollapseOrigin(origin.x, origin.y);
}

export function collapseIfDetached(
  api: TreeApi,
  types: HarvestTypes,
  originX: number,
  originY: number,
  writer: DropWriter = api,
  options?: CollapseOptions,
): void {
  if (collapsing) return;
  collapsing = true;
  try {
    const omitCell = options?.omitCell;
    const seen = new Set<string>();
    const starts: Cell[] = [];
    if (isTrunkCell(api, types, originX, originY, omitCell)) {
      starts.push({ x: originX, y: originY });
    }
    for (const [dx, dy] of DIRS) {
      const cellX = originX + dx;
      const cellY = originY + dy;
      if (isTrunkCell(api, types, cellX, cellY, omitCell)) {
        starts.push({ x: cellX, y: cellY });
      }
    }
    for (const start of starts) {
      if (seen.has(`${start.x},${start.y}`)) continue;
      const trunk = flood(api, types, start, seen, true, omitCell);
      if (trunk.length === 0) continue;
      const attached = trunk.some((cell) => touchesDirt(api, cell.x, cell.y));
      if (attached) continue;
      const cells = flood(api, types, start, new Set(), false, omitCell);
      collapseComponent(api, types, cells, writer, start);
    }
  } finally {
    collapsing = false;
  }
  if (writer !== api) return;
  let passes = 0;
  while (hasPendingCollapses() && passes < 32) {
    passes += 1;
    drainPendingCollapses(api, types, writer);
  }
}
