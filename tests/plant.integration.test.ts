import assert from "node:assert/strict";
import { before, describe, test } from "node:test";
import { setupGame } from "@modkit/test";
import {
  CELL_SIZE,
  ELEMENT,
  PAD,
  skipUnlessLoaded,
  TERRAIN,
  type FloorKind,
  type PlantPad,
  type PlantPadResult,
} from "./helpers.ts";

const game = await setupGame();

before(async () => {
  await game.clock.install();
  await game.seed();
});

function clearAndFloor(pad: PlantPad): PlantPadResult {
  const api = sandkit.api;
  try {
    const coneType = api.elements.getTypeById(pad.coneId);
    if (typeof coneType !== "number" || !Number.isFinite(coneType)) {
      return { ok: false, reason: `${pad.coneId} is not registered` };
    }
  } catch {
    return { ok: false, reason: `${pad.coneId} is not registered` };
  }

  const floorType =
    pad.floor === "dirt"
      ? sandkit.enums.CellType.Dirt
      : pad.floor === "stone"
        ? sandkit.enums.CellType.Stone
        : null;

  const minX = pad.coneX - 16;
  const maxX = pad.coneX + 16;
  const minY = pad.coneY - 80;
  const maxY = pad.coneY + 4;
  api.grid.mutate((writer) => {
    for (let cellY = minY; cellY <= maxY; cellY += 1) {
      for (let cellX = minX; cellX <= maxX; cellX += 1) {
        writer.elements.removeAtCell(cellX, cellY);
        writer.terrains.removeAtCell(cellX, cellY);
      }
    }
    if (floorType != null) {
      for (let dx = -2; dx <= 2; dx += 1) {
        writer.terrains.createAtCell(pad.coneX + dx, pad.coneY + 1, floorType);
      }
    }
  });
  api.camera.setFocusAtWorld((pad.coneX + 1) * pad.cellSize, pad.coneY * pad.cellSize);
  return { ok: true };
}

function placeSeed(pad: PlantPad): void {
  const api = sandkit.api;
  api.grid.mutate((writer) => {
    writer.elements.createAtCell(pad.coneX, pad.coneY, pad.coneId, {
      isFreeFalling: pad.floor === "dirt" && pad.water,
    });
    if (pad.water) {
      writer.elements.createAtCell(pad.coneX + 1, pad.coneY, "water", { isFreeFalling: false });
    }
  });
  api.grid.reportActivityAtCell(pad.coneX, pad.coneY);
  if (pad.water) api.grid.reportActivityAtCell(pad.coneX + 1, pad.coneY);
}

function planted(coneId: string, shootId: string, woodId: string, cellX: number, cellY: number) {
  const api = sandkit.api;
  const cone = api.elements.getTypeById(coneId);
  const shoot = api.elements.getTypeById(shootId);
  const wood = api.terrains.getTypeById(woodId);
  let shootNearby = false;
  for (let dy = 0; dy <= 80; dy += 1) {
    if (api.elements.isTypeAtCell(cellX, cellY - dy, shoot)) {
      shootNearby = true;
      break;
    }
  }
  return {
    cone: api.elements.isTypeAtCell(cellX, cellY, cone),
    shoot: shootNearby,
    wood: api.terrains.getTypeAtCell(cellX, cellY) === wood,
  };
}

function cellKinds(coneId: string, shootId: string, cellX: number, cellY: number) {
  const api = sandkit.api;
  const cone = api.elements.getTypeById(coneId);
  const shoot = api.elements.getTypeById(shootId);
  return {
    cone: api.elements.isTypeAtCell(cellX, cellY, cone),
    shoot: api.elements.isTypeAtCell(cellX, cellY, shoot),
  };
}

function padArgs(floor: FloorKind, water: boolean): PlantPad {
  return {
    coneId: ELEMENT.pineCone,
    coneX: PAD.x,
    coneY: PAD.y,
    cellSize: CELL_SIZE,
    floor,
    water,
  };
}

async function waitTicksUntil<TArgs extends unknown[], T>(
  read: (...args: TArgs) => T,
  match: (value: T) => boolean,
  args: TArgs,
  maxTicks: number,
  message: string,
): Promise<T> {
  let live = await game.evaluate(read, ...args);
  let used = 0;
  while (!match(live) && used < maxTicks) {
    const step = Math.min(5, maxTicks - used);
    await game.ticks(step);
    used += step;
    live = await game.evaluate(read, ...args);
  }
  if (!match(live)) {
    throw new Error(`${message}: last value ${JSON.stringify(live)} after ${used} ticks`);
  }
  return live;
}

async function setupPad(floor: FloorKind, water: boolean): Promise<PlantPadResult> {
  const pad = padArgs(floor, water);
  const prepared = await game.evaluate(clearAndFloor, pad);
  if (!prepared.ok) return prepared;
  await game.evaluate(placeSeed, pad);
  return { ok: true };
}

describe("pine cone plant", { concurrency: false }, () => {
  test("cone on dirt without water stays a cone", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const prepared = await setupPad("dirt", false);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      await game.ticks(30);
      const live = await game.evaluate(
        cellKinds,
        ELEMENT.pineCone,
        ELEMENT.pineShoot,
        PAD.x,
        PAD.y,
      );
      assert.equal(live.cone, true);
      assert.equal(live.shoot, false);
    } finally {
      await game.evaluate(clearAndFloor, padArgs("dirt", false));
    }
  });

  test("cone on stone with water stays a cone", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const prepared = await setupPad("stone", true);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      await game.ticks(30);
      const live = await game.evaluate(
        cellKinds,
        ELEMENT.pineCone,
        ELEMENT.pineShoot,
        PAD.x,
        PAD.y,
      );
      assert.equal(live.cone, true);
      assert.equal(live.shoot, false);
    } finally {
      await game.evaluate(clearAndFloor, padArgs("stone", false));
    }
  });

  test("cone on dirt with water becomes a shoot", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const prepared = await setupPad("dirt", true);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      const live = await waitTicksUntil(
        planted,
        (value) => value.shoot || value.wood,
        [ELEMENT.pineCone, ELEMENT.pineShoot, TERRAIN.pineWood, PAD.x, PAD.y],
        80,
        "cone on dirt with water did not become a shoot",
      );
      assert.ok(live.shoot || live.wood);
    } finally {
      await game.evaluate(clearAndFloor, padArgs("dirt", false));
    }
  });
});

function oakPadArgs(floor: FloorKind, water: boolean): PlantPad {
  return {
    coneId: ELEMENT.acorn,
    coneX: PAD.x,
    coneY: PAD.y,
    cellSize: CELL_SIZE,
    floor,
    water,
  };
}

async function setupOakPad(floor: FloorKind, water: boolean): Promise<PlantPadResult> {
  const pad = oakPadArgs(floor, water);
  const prepared = await game.evaluate(clearAndFloor, pad);
  if (!prepared.ok) return prepared;
  await game.evaluate(placeSeed, pad);
  return { ok: true };
}

type OakCrownSample = {
  trunkWood: number;
  branchWood: number;
  woodMaxDx: number;
  leaves: number;
  leafMaxDx: number;
  shoot: boolean;
};

function sampleOakCrown(
  rootX: number,
  rootY: number,
  oakWoodId: string,
  oakLeafId: string,
  oakShootId: string,
): OakCrownSample {
  const api = sandkit.api;
  const oakWood = api.terrains.getTypeById(oakWoodId);
  const oakLeaf = api.elements.getTypeById(oakLeafId);
  const oakShoot = api.elements.getTypeById(oakShootId);
  let trunkWood = 0;
  let branchWood = 0;
  let woodMaxDx = 0;
  let leaves = 0;
  let leafMaxDx = 0;
  let shoot = false;
  for (let dy = 0; dy <= 80; dy += 1) {
    for (let dx = -16; dx <= 16; dx += 1) {
      const cellX = rootX + dx;
      const cellY = rootY - dy;
      if (api.elements.isTypeAtCell(cellX, cellY, oakShoot)) shoot = true;
      if (api.elements.isTypeAtCell(cellX, cellY, oakLeaf)) {
        leaves += 1;
        leafMaxDx = Math.max(leafMaxDx, Math.abs(dx));
      }
      if (api.terrains.getTypeAtCell(cellX, cellY) !== oakWood) continue;
      const adx = Math.abs(dx);
      woodMaxDx = Math.max(woodMaxDx, adx);
      if (adx <= 2) trunkWood += 1;
      else branchWood += 1;
    }
  }
  return { trunkWood, branchWood, woodMaxDx, leaves, leafMaxDx, shoot };
}

describe("acorn plant", { concurrency: false }, () => {
  test("acorn on dirt with water becomes an oak shoot", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const prepared = await setupOakPad("dirt", true);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      const live = await waitTicksUntil(
        planted,
        (value) => value.shoot || value.wood,
        [ELEMENT.acorn, ELEMENT.oakShoot, TERRAIN.oakWood, PAD.x, PAD.y],
        80,
        "acorn on dirt with water did not become a shoot",
      );
      assert.ok(live.shoot || live.wood);
    } finally {
      await game.evaluate(clearAndFloor, oakPadArgs("dirt", false));
    }
  });

  test("mature oak has forked wood and leaf tufts, not a stick with nubs", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const prepared = await setupOakPad("dirt", true);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      await waitTicksUntil(
        planted,
        (value) => value.shoot || value.wood,
        [ELEMENT.acorn, ELEMENT.oakShoot, TERRAIN.oakWood, PAD.x, PAD.y],
        80,
        "acorn did not become a shoot",
      );
      const live = await waitTicksUntil(
        sampleOakCrown,
        (value) =>
          !value.shoot &&
          value.trunkWood >= 40 &&
          value.branchWood >= 12 &&
          value.woodMaxDx > 4 &&
          value.leaves >= 40 &&
          value.leafMaxDx >= value.woodMaxDx,
        [PAD.x, PAD.y, TERRAIN.oakWood, ELEMENT.oakLeaf, ELEMENT.oakShoot],
        4000,
        "oak crown did not grow forks and leaf tufts",
      );
      assert.ok(live.branchWood >= 12, `expected forked oak wood, got ${live.branchWood}`);
      assert.ok(live.leaves >= 40, `expected leaf tufts, got ${live.leaves}`);
    } finally {
      await game.evaluate(clearAndFloor, oakPadArgs("dirt", false));
    }
  });
});
