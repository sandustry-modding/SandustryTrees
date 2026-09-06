import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { setupGame } from "@modkit/test";
import { CELL_SIZE, ELEMENT, PAD, skipUnlessLoaded } from "./helpers.ts";

const game = await setupGame();

/** Away from plant and collapse pads on the void platform. */
const COMPOST_PAD = { x: PAD.x + 80, y: PAD.y };

type CompostPad = {
  x: number;
  y: number;
  cellSize: number;
  compostId: string;
  wetCompostId: string;
};

type CompostSetupResult = { ok: true } | { ok: false; reason: string };

type CompostState = {
  dirt: boolean;
  compost: boolean;
  wetCompost: boolean;
};

function clearPad(pad: CompostPad): CompostSetupResult {
  const api = sandkit.api;
  const floor = sandkit.enums.CellType.Stone;
  try {
    const compost = api.elements.getTypeById(pad.compostId);
    const wet = api.elements.getTypeById(pad.wetCompostId);
    if (typeof compost !== "number" || !Number.isFinite(compost)) {
      return { ok: false, reason: `${pad.compostId} is not registered` };
    }
    if (typeof wet !== "number" || !Number.isFinite(wet)) {
      return { ok: false, reason: `${pad.wetCompostId} is not registered` };
    }
  } catch {
    return { ok: false, reason: "compost types are not registered" };
  }

  const { x, y } = pad;
  api.grid.mutate((writer) => {
    for (let cellY = y - 4; cellY <= y + 4; cellY += 1) {
      for (let cellX = x - 2; cellX <= x + 2; cellX += 1) {
        writer.elements.removeAtCell(cellX, cellY);
        writer.terrains.removeAtCell(cellX, cellY);
      }
    }
    for (let dx = -1; dx <= 1; dx += 1) {
      writer.terrains.createAtCell(x + dx, y + 1, floor);
    }
  });
  api.camera.setFocusAtWorld((x + 1) * pad.cellSize, y * pad.cellSize);
  return { ok: true };
}

function placeDryCompost(pad: CompostPad): void {
  const api = sandkit.api;
  const compost = api.elements.getTypeById(pad.compostId);
  api.grid.mutate((writer) => {
    writer.elements.createAtCell(pad.x, pad.y, compost, { isFreeFalling: false });
  });
  api.grid.reportActivityAtCell(pad.x, pad.y);
}

function placeWetCompost(pad: CompostPad): void {
  const api = sandkit.api;
  const wet = api.elements.getTypeById(pad.wetCompostId);
  api.grid.mutate((writer) => {
    writer.elements.createAtCell(pad.x, pad.y, wet, { isFreeFalling: false });
  });
  api.grid.reportActivityAtCell(pad.x, pad.y);
}

function placeWaterBeside(pad: CompostPad): void {
  const api = sandkit.api;
  api.grid.mutate((writer) => {
    writer.elements.createAtCell(pad.x + 1, pad.y, "water", { isFreeFalling: false });
  });
  api.grid.reportActivityAtCell(pad.x + 1, pad.y);
}

function compostState(pad: CompostPad): CompostState {
  const api = sandkit.api;
  const dirt = sandkit.enums.CellType.Dirt;
  const { x, y } = pad;
  return {
    dirt: api.terrains.getTypeAtCell(x, y) === dirt,
    compost: api.elements.isTypeAtCell(x, y, pad.compostId),
    wetCompost: api.elements.isTypeAtCell(x, y, pad.wetCompostId),
  };
}

function padArgs(dx = 0): CompostPad {
  return {
    x: COMPOST_PAD.x + dx,
    y: COMPOST_PAD.y,
    cellSize: CELL_SIZE,
    compostId: ELEMENT.compost,
    wetCompostId: ELEMENT.wetCompost,
  };
}

describe("compost", { concurrency: false }, () => {
  test("dry compost that rests does not become dirt", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const pad = padArgs();
    const prepared = await game.evaluate(clearPad, pad);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      await game.evaluate(placeDryCompost, pad);
      await game.runSimulation(750);
      const live = await game.evaluate(compostState, pad);
      assert.equal(live.compost, true);
      assert.equal(live.dirt, false);
      assert.equal(live.wetCompost, false);
    } finally {
      await game.pauseSimulation();
    }
  });

  test("idle wet compost becomes dirt", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const pad = padArgs();
    const prepared = await game.evaluate(clearPad, pad);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      await game.evaluate(placeWetCompost, pad);
      await game.resumeSimulation();
      const deadline = Date.now() + 15000;
      let live = await game.evaluate(compostState, pad);
      while (Date.now() < deadline && !live.dirt) {
        await game.runSimulation(250);
        live = await game.evaluate(compostState, pad);
      }
      assert.equal(live.dirt, true, "wet compost did not become dirt");
      assert.equal(live.wetCompost, false);
      assert.equal(live.compost, false);
    } finally {
      await game.pauseSimulation();
    }
  });

  test("compost that touches water becomes wet compost then dirt", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const pad = padArgs(4);
    const prepared = await game.evaluate(clearPad, pad);
    if (!prepared.ok) {
      t.skip(prepared.reason);
      return;
    }

    try {
      await game.evaluate(placeDryCompost, pad);
      await game.runSimulation(1000);
      await game.evaluate(placeWaterBeside, pad);
      await game.resumeSimulation();
      const deadline = Date.now() + 15000;
      let live = await game.evaluate(compostState, pad);
      while (Date.now() < deadline && !live.dirt) {
        await game.runSimulation(250);
        live = await game.evaluate(compostState, pad);
      }
      assert.equal(live.dirt, true, "wetted compost did not become dirt");
      assert.equal(live.compost, false);
      assert.equal(live.wetCompost, false);
    } finally {
      await game.pauseSimulation();
    }
  });
});
