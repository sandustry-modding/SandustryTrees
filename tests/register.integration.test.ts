import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { setupGame } from "@modkit/test";
import { ELEMENT, MOD_ID, skipUnlessLoaded, STRUCTURE, TERRAIN } from "./helpers.ts";

const game = await setupGame();

describe("trees register", { concurrency: false }, () => {
  test("pine elements and pine wood terrain are registered", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const live = await game.waitFor(
      (elementIds: string[], terrainId: string) => {
        const api = sandkit.api;
        const elements = elementIds.map((id) => {
          try {
            const type = api.elements.getTypeById(id);
            return typeof type === "number" && Number.isFinite(type);
          } catch {
            return false;
          }
        });
        let terrain = false;
        try {
          const type = api.terrains.getTypeById(terrainId);
          terrain = typeof type === "number" && Number.isFinite(type);
        } catch {
          terrain = false;
        }
        return { elements, terrain };
      },
      (value) => value.elements.every(Boolean) && value.terrain,
      {
        args: [
          [
            ELEMENT.pineCone,
            ELEMENT.pineShoot,
            ELEMENT.pineNeedle,
            ELEMENT.wood,
            ELEMENT.charcoal,
            ELEMENT.compost,
          ],
          TERRAIN.pineWood,
        ],
        message: "trees content did not register",
        timeoutMs: 4000,
      },
    );
    assert.equal(live.terrain, true);
    assert.equal(live.elements.length, 6);
  });

  test("sand sieve structure and sprite are registered", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;

    const live = await game.waitFor(
      (structureId: string) => {
        let structure = false;
        try {
          structure = sandkit.api.structures.getTypeById(structureId) != null;
        } catch {
          structure = false;
        }
        return { structure };
      },
      (value) => value.structure,
      { args: [STRUCTURE.sieve], message: "sand sieve did not register", timeoutMs: 4000 },
    );
    assert.equal(live.structure, true);
  });

  test("trees mod is in the ordered list", async (t) => {
    const ids = await game.orderedModIds();
    if (!(await skipUnlessLoaded(ids, t))) return;
    assert.ok(ids.includes(MOD_ID));
  });
});
