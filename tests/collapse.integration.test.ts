import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { setupGame } from "@modkit/test";
import { CELL_SIZE, ELEMENT, MOD_ID, PAD, skipUnlessLoaded, TERRAIN } from "./helpers.ts";

const game = await setupGame();

/** Away from plant.integration pads on the void platform. */
const COLLAPSE_PAD = { x: PAD.x + 40, y: PAD.y };

type TrunkPad = {
  trunkX: number;
  trunkY: number;
  height: number;
  cellSize: number;
  pineWoodId: string;
  woodId: string;
};

type TrunkCounts = {
  pineWood: number;
  wood: number;
};

function setupTrunk(
  pad: TrunkPad,
): { ok: true; pineWood: number } | { ok: false; reason: string } {
  const api = sandkit.api;
  let pineWood: number;
  try {
    pineWood = api.terrains.getTypeById(pad.pineWoodId);
    if (typeof pineWood !== "number" || !Number.isFinite(pineWood)) {
      return { ok: false, reason: `${pad.pineWoodId} is not registered` };
    }
  } catch {
    return { ok: false, reason: `${pad.pineWoodId} is not registered` };
  }

  const dirt = sandkit.enums.CellType.Dirt;
  const minX = pad.trunkX - 4;
  const maxX = pad.trunkX + 4;
  const minY = pad.trunkY - pad.height - 4;
  const maxY = pad.trunkY + 4;

  api.grid.mutate((writer) => {
    for (let cellY = minY; cellY <= maxY; cellY += 1) {
      for (let cellX = minX; cellX <= maxX; cellX += 1) {
        writer.elements.removeAtCell(cellX, cellY);
        writer.terrains.removeAtCell(cellX, cellY);
      }
    }
    for (let dx = -1; dx <= 1; dx += 1) {
      writer.terrains.createAtCell(pad.trunkX + dx, pad.trunkY + 1, dirt);
    }
    for (let dy = 0; dy < pad.height; dy += 1) {
      writer.terrains.createAtCell(pad.trunkX, pad.trunkY - dy, pineWood);
    }
  });
  api.camera.setFocusAtWorld((pad.trunkX + 1) * pad.cellSize, pad.trunkY * pad.cellSize);
  api.grid.reportActivityAtCell(pad.trunkX, pad.trunkY);
  return { ok: true, pineWood: pad.height };
}

function countTrunk(pad: TrunkPad): TrunkCounts {
  const api = sandkit.api;
  const pineWood = api.terrains.getTypeById(pad.pineWoodId);
  const wood = api.elements.getTypeById(pad.woodId);
  let pineWoodCells = 0;
  let woodCells = 0;
  for (let dy = -2; dy < pad.height + 16; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const cellX = pad.trunkX + dx;
      const cellY = pad.trunkY - dy;
      if (api.terrains.getTypeAtCell(cellX, cellY) === pineWood) pineWoodCells += 1;
      if (api.elements.isTypeAtCell(cellX, cellY, wood)) woodCells += 1;
    }
  }
  return { pineWood: pineWoodCells, wood: woodCells };
}

function chopBottomTrunk(pad: TrunkPad): void {
  const api = sandkit.api;
  api.terrains.damageAtCell(pad.trunkX, pad.trunkY, 99);
  api.grid.reportActivityAtCell(pad.trunkX, pad.trunkY);
}

function padArgs(height: number): TrunkPad {
  return {
    trunkX: COLLAPSE_PAD.x,
    trunkY: COLLAPSE_PAD.y,
    height,
    cellSize: CELL_SIZE,
    pineWoodId: TERRAIN.pineWood,
    woodId: ELEMENT.wood,
  };
}

describe("pine trunk collapse", { concurrency: false }, () => {
  test("chopping the bottom trunk cell collapses the rest into wood", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const pad = padArgs(8);
    const prepared = await game.evaluate(setupTrunk, pad);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      await game.resumeSimulation();
      await game.waitFor(countTrunk, (value) => value.pineWood === pad.height, {
        args: [pad],
        message: "pine trunk did not appear on the pad",
        timeoutMs: 4000,
      });

      await game.evaluate(chopBottomTrunk, pad);

      const deadline = Date.now() + 12000;
      let live = await game.evaluate(countTrunk, pad);
      while (Date.now() < deadline && !(live.pineWood === 0 && live.wood > 0)) {
        await game.runSimulation(250);
        live = await game.evaluate(countTrunk, pad);
      }
      assert.equal(live.pineWood, 0, "detached trunk did not collapse into wood");
      assert.ok(live.wood > 0, `expected falling wood, got wood=${live.wood}`);
    } finally {
      await game.pauseSimulation();
    }
  });
});
