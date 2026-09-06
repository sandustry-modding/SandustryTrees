import assert from "node:assert/strict";
import { test } from "node:test";
import { growPineShoot, type GrowTypes } from "./grow.ts";

const types: GrowTypes = {
  pineShoot: 1,
  pineWood: 2,
  pineNeedle: 3,
  pineCone: 4,
};

test("growPineShoot continues when a needle sits above the shoot", () => {
  const shoot = { x: 10, y: 80 };
  const cells = new Map<string, { terrain?: number; element?: number; field1?: number }>();
  cells.set(`${shoot.x},${shoot.y}`, { element: types.pineShoot, field1: 30 });
  cells.set(`${shoot.x},${shoot.y - 1}`, { element: types.pineNeedle });

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
  };

  growPineShoot(api as unknown as WorkerSandkitApi, types, shoot.x, shoot.y);

  const woodRows = [...cells.values()].filter((cell) => cell.terrain === types.pineWood).length;
  assert.ok(woodRows > 1, `expected the trunk to grow, wood rows=${woodRows}`);
  const shootCells = [...cells.entries()].filter(([, cell]) => cell.element === types.pineShoot);
  assert.equal(shootCells.length, 1);
  const shootY = Number(shootCells[0]?.[0].split(",")[1]);
  assert.ok(shootY < shoot.y, `shoot should rise, y=${shootY}`);
});
