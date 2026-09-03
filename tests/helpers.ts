import type { TestContext } from "node:test";
import { ELEMENT, STRUCTURE, TERRAIN } from "../shared/ids.ts";
import { modinfo } from "../modinfo.ts";

export const MOD_ID = modinfo.id;
export { ELEMENT, STRUCTURE, TERRAIN };

/** Void platform centre in the 1024×1024 integration save (see modkit/test/helpers/world.ts). */
export const PAD = { x: 512, y: 511 };
export const CELL_SIZE = 4;

export async function skipUnlessLoaded(ids: readonly string[], t: TestContext): Promise<boolean> {
  if (ids.includes(MOD_ID)) return true;
  t.skip(`${MOD_ID} is not loaded`);
  return false;
}

export type FloorKind = "dirt" | "stone" | "none";

export type PlantPad = {
  coneId: string;
  coneX: number;
  coneY: number;
  cellSize: number;
  floor: FloorKind;
  water: boolean;
};

export type PlantPadResult = { ok: true } | { ok: false; reason: string };
