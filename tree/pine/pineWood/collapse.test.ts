import assert from "node:assert/strict";
import { test } from "node:test";
import { collapseIfDetached, type HarvestTypes } from "./collapse.ts";

const dirt = 1;
(globalThis as { sandkit?: { enums: { CellType: { Dirt: number } } } }).sandkit = {
  enums: { CellType: { Dirt: dirt } },
};

const types: HarvestTypes = {
  pineWood: 10,
  pineNeedle: 11,
  pineShoot: 12,
  pineCone: 13,
  wood: 20,
  compost: 21,
};

function makeTreeApi(cells: Map<string, { terrain?: number; element?: number }>) {
  const key = (x: number, y: number) => `${x},${y}`;
  const at = (x: number, y: number) => cells.get(key(x, y));
  const writes: string[] = [];

  const api = {
    terrains: {
      getTypeAtCell: (x: number, y: number) => at(x, y)?.terrain ?? null,
      removeAtCell: (x: number, y: number) => {
        writes.push(`terrain:${x},${y}`);
        const cur = at(x, y);
        if (!cur) return;
        delete cur.terrain;
        if (cur.element == null) cells.delete(key(x, y));
      },
    },
    elements: {
      isTypeAtCell: (x: number, y: number, type: number) => at(x, y)?.element === type,
      createAtCell: (x: number, y: number, type: number) => {
        writes.push(`element:${x},${y}:${type}`);
        cells.set(key(x, y), { ...at(x, y), element: type });
      },
      replaceAtCell: (x: number, y: number, type: number) => {
        writes.push(`replace:${x},${y}:${type}`);
        cells.set(key(x, y), { ...at(x, y), element: type });
      },
    },
    grid: { reportActivityAtCell: () => {} },
  };

  return { api, writes };
}

test("collapseIfDetached drops a trunk when the chopped cell still reads as wood", () => {
  const cells = new Map<string, { terrain?: number; element?: number }>();
  const trunkX = 5;
  for (let y = 8; y <= 12; y += 1) {
    cells.set(`${trunkX},${y}`, { terrain: types.pineWood });
  }
  cells.set(`${trunkX},${13}`, { terrain: dirt });

  const { api, writes } = makeTreeApi(cells);
  const choppedY = 12;

  collapseIfDetached(api, types, trunkX, choppedY, api, {
    omitCell: { x: trunkX, y: choppedY },
  });

  assert.ok(writes.length > 0, "detached trunk should start collapsing");
  assert.ok(
    writes.some((entry) => entry.startsWith(`terrain:${trunkX},${choppedY - 1}`)),
    `expected collapse to convert trunk above the chop, got ${writes.join("; ")}`,
  );
});

test("collapseIfDetached clears a multi-cell trunk in one harvest", () => {
  const cells = new Map<string, { terrain?: number; element?: number }>();
  const trunkX = 5;
  for (let y = 4; y <= 11; y += 1) {
    cells.set(`${trunkX},${y}`, { terrain: types.pineWood });
  }
  cells.set(`${trunkX},${12}`, { terrain: dirt });

  const { api, writes } = makeTreeApi(cells);
  const choppedY = 11;

  collapseIfDetached(api, types, trunkX, choppedY, api, {
    omitCell: { x: trunkX, y: choppedY },
  });

  const pineDropped = writes.filter((entry) => entry.startsWith("element:")).length;
  assert.ok(pineDropped >= 3, `detached trunk should convert wood cells, got ${pineDropped}`);
  assert.ok(
    writes.some((entry) => entry.startsWith(`terrain:${trunkX},${choppedY - 1}`)),
    `expected collapse to convert trunk above the chop, got ${writes.join("; ")}`,
  );
});

test("collapseIfDetached keeps a trunk that still touches dirt", () => {
  const cells = new Map<string, { terrain?: number; element?: number }>();
  const trunkX = 5;
  for (let y = 10; y <= 12; y += 1) {
    cells.set(`${trunkX},${y}`, { terrain: types.pineWood });
  }
  cells.set(`${trunkX},${13}`, { terrain: dirt });

  const { api, writes } = makeTreeApi(cells);

  collapseIfDetached(api, types, trunkX, 11, api);

  assert.equal(writes.length, 0, "attached trunk should stay standing");
});
