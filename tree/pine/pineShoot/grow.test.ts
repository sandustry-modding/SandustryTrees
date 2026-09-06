import assert from "node:assert/strict";
import { test } from "node:test";
import { config } from "../../../config.ts";
import { growPineShoot, type GrowTypes } from "./grow.ts";

const types: GrowTypes = {
  pineShoot: 1,
  pineWood: 2,
  pineNeedle: 3,
  pineCone: 4,
};

type CellState = { terrain?: number; element?: number; field1?: number };

function makeGrid(shoot: { x: number; y: number }, field1: number) {
  const cells = new Map<string, CellState>();
  cells.set(`${shoot.x},${shoot.y}`, { element: types.pineShoot, field1 });
  const key = (x: number, y: number) => `${x},${y}`;
  const at = (x: number, y: number) => cells.get(key(x, y));
  const api = {
    terrains: {
      getTypeAtCell: (x: number, y: number) => at(x, y)?.terrain ?? null,
      createAtCell: (x: number, y: number, terrain: number) => {
        cells.set(key(x, y), { ...at(x, y), terrain });
      },
      removeAtCell: (x: number, y: number) => {
        const cur = at(x, y);
        if (!cur) return;
        delete cur.terrain;
        if (cur.element == null) cells.delete(key(x, y));
        else cells.set(key(x, y), cur);
      },
    },
    elements: {
      isTypeAtCell: (x: number, y: number, type: number) => at(x, y)?.element === type,
      getTypeAtCell: (x: number, y: number) => at(x, y)?.element ?? null,
      getDataFieldAtCell: (x: number, y: number) => at(x, y)?.field1,
      removeAtCell: (x: number, y: number) => {
        const cur = at(x, y);
        if (!cur) return;
        delete cur.element;
        delete cur.field1;
        if (cur.terrain == null) cells.delete(key(x, y));
        else cells.set(key(x, y), cur);
      },
      createAtCell: (
        x: number,
        y: number,
        type: number,
        options?: { dataFields?: { field1?: number } },
      ) => {
        cells.set(key(x, y), {
          ...at(x, y),
          element: type,
          field1: options?.dataFields?.field1,
        });
      },
      replaceAtCell: () => {},
    },
    grid: {
      isCellEmptyAtCell: (x: number, y: number) => {
        const cur = at(x, y);
        return !cur || (cur.terrain == null && cur.element == null);
      },
      isTerrainAtCell: (x: number, y: number) => at(x, y)?.terrain != null,
      reportActivityAtCell: () => {},
    },
    main: { emitEvent: () => {} },
    random: { float: () => 0.5 },
  };
  return { cells, api };
}

function maxWoodDx(cells: Map<string, CellState>, rootX: number): number {
  let maxDx = 0;
  for (const [cellKey, cell] of cells) {
    if (cell.terrain !== types.pineWood) continue;
    const x = Number(cellKey.split(",")[0]);
    maxDx = Math.max(maxDx, Math.abs(x - rootX));
  }
  return maxDx;
}

function growUntilDone(
  cells: Map<string, CellState>,
  api: ReturnType<typeof makeGrid>["api"],
  start: { x: number; y: number },
): void {
  for (let i = 0; i < config.pineTrunkHeight + 8; i += 1) {
    const shootCells = [...cells.entries()].filter(([, cell]) => cell.element === types.pineShoot);
    if (shootCells.length === 0) break;
    const [xy] = shootCells[0] ?? [];
    if (!xy) break;
    const [x, y] = xy.split(",").map(Number);
    growPineShoot(api as unknown as WorkerSandkitApi, types, x ?? start.x, y ?? start.y);
  }
}

test("growPineShoot continues when a needle sits above the shoot", () => {
  const shoot = { x: 10, y: 80 };
  const { cells, api } = makeGrid(shoot, 30);
  cells.set(`${shoot.x},${shoot.y - 1}`, { element: types.pineNeedle });

  growPineShoot(api as unknown as WorkerSandkitApi, types, shoot.x, shoot.y);

  const woodRows = [...cells.values()].filter((cell) => cell.terrain === types.pineWood).length;
  assert.ok(woodRows > 1, `expected the trunk to grow, wood rows=${woodRows}`);
  const shootCells = [...cells.entries()].filter(([, cell]) => cell.element === types.pineShoot);
  assert.equal(shootCells.length, 1);
  const shootY = Number(shootCells[0]?.[0].split(",")[1]);
  assert.ok(shootY < shoot.y, `shoot should rise, y=${shootY}`);
});

test("growPineShoot starts one cell wide", () => {
  const shoot = { x: 10, y: 120 };
  const { cells, api } = makeGrid(shoot, 0);
  growPineShoot(api as unknown as WorkerSandkitApi, types, shoot.x, shoot.y);
  assert.equal(maxWoodDx(cells, shoot.x), 0);
});

test("growPineShoot thickens the bole as it grows", () => {
  const shoot = { x: 10, y: 160 };
  const { cells, api } = makeGrid(shoot, 0);
  for (let i = 0; i < 8; i += 1) {
    const shootCells = [...cells.entries()].filter(([, cell]) => cell.element === types.pineShoot);
    if (shootCells.length === 0) break;
    const [xy] = shootCells[0] ?? [];
    if (!xy) break;
    const [x, y] = xy.split(",").map(Number);
    growPineShoot(api as unknown as WorkerSandkitApi, types, x ?? shoot.x, y ?? shoot.y);
  }
  const youngDx = maxWoodDx(cells, shoot.x);
  growUntilDone(cells, api, shoot);
  const matureDx = maxWoodDx(cells, shoot.x);
  assert.ok(youngDx <= 0, `young pine should stay 1-wide, dx=${youngDx}`);
  assert.ok(
    matureDx >= config.pineTrunkHalfWidth,
    `mature pine should reach bole width, dx=${matureDx}`,
  );
});
