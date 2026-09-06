import assert from "node:assert/strict";
import { test } from "node:test";
import { growOakShoot, type GrowTypes } from "./grow.ts";
import { TRUNK_HEIGHT } from "./constants.ts";

const types: GrowTypes = {
  oakShoot: 1,
  oakWood: 2,
  oakLeaf: 3,
  acorn: 4,
};

type CellState = { terrain?: number; element?: number; field1?: number };

function makeGrid(shoot: { x: number; y: number }, field1: number) {
  const cells = new Map<string, CellState>();
  cells.set(`${shoot.x},${shoot.y}`, { element: types.oakShoot, field1 });
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

test("growOakShoot continues when an oak leaf sits above the shoot", () => {
  const shoot = { x: 10, y: 80 };
  const { cells, api } = makeGrid(shoot, 30);
  cells.set(`${shoot.x},${shoot.y - 1}`, { element: types.oakLeaf });

  growOakShoot(api as unknown as WorkerSandkitApi, types, shoot.x, shoot.y);

  const woodRows = [...cells.values()].filter((cell) => cell.terrain === types.oakWood).length;
  assert.ok(woodRows > 1, `expected the trunk to grow, wood rows=${woodRows}`);
  const shootCells = [...cells.entries()].filter(([, cell]) => cell.element === types.oakShoot);
  assert.equal(shootCells.length, 1);
  const shootY = Number(shootCells[0]?.[0].split(",")[1]);
  assert.ok(shootY < shoot.y, `shoot should rise, y=${shootY}`);
});

test("growOakShoot places oak wood past the trunk", () => {
  const shoot = { x: 10, y: 80 };
  const { cells, api } = makeGrid(shoot, 36);

  growOakShoot(api as unknown as WorkerSandkitApi, types, shoot.x, shoot.y);

  const branchWood = [...cells.entries()].filter(([cellKey, cell]) => {
    if (cell.terrain !== types.oakWood) return false;
    const x = Number(cellKey.split(",")[0]);
    return Math.abs(x - shoot.x) > 2;
  }).length;
  assert.ok(branchWood >= 8, `expected forked oak wood, branchWood=${branchWood}`);
});

test("growOakShoot does not fill a wood wedge", () => {
  const shoot = { x: 10, y: 120 };
  const { cells, api } = makeGrid(shoot, 0);
  for (let i = 0; i < TRUNK_HEIGHT + 4; i += 1) {
    const shootCells = [...cells.entries()].filter(([, cell]) => cell.element === types.oakShoot);
    if (shootCells.length === 0) break;
    const [xy] = shootCells[0] ?? [];
    if (!xy) break;
    const [x, y] = xy.split(",").map(Number);
    growOakShoot(api as unknown as WorkerSandkitApi, types, x ?? shoot.x, y ?? shoot.y);
  }
  const wood = [...cells.values()].filter((cell) => cell.terrain === types.oakWood).length;
  assert.ok(wood > 40, `expected a trunk, wood=${wood}`);
  assert.ok(wood < 450, `expected no funnel wedge, wood=${wood}`);
});
