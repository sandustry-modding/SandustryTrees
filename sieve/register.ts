import { SPRITE, STRUCTURE } from "../shared/ids.ts";
import { modinfo } from "../modinfo.ts";
import {
  SIEVE_PINE_CONE_CHANCE,
  SIEVE_PROCESS_INTERVAL_MS,
} from "./constants.ts";
import { processSieve } from "./process.ts";

const api = sandkit.api;
const { CellType } = sandkit.enums;

const SIEVE_PROCESSOR_ID = `${modinfo.id}:sieve:process`;

const SIEVE_I18N = {
  name: `structures|${STRUCTURE.sieve}|name`,
  description: `structures|${STRUCTURE.sieve}|description`,
} as const;

/** Solid top row — sand rests on the cell above and does not fall through. */
const sieveShape = [
  [CellType.Block, CellType.Block, CellType.Block, CellType.Block],
] as const;

function unlockSieveForBuilding(): void {
  api.player.buildings.unlockById(STRUCTURE.sieve);
}

export async function registerSieve(): Promise<void> {
  api.i18n.register("en", {
    [SIEVE_I18N.name]: "Sand Sieve",
    [SIEVE_I18N.description]:
      "Slowly sifts dry sand from above. Most sand is lost. Very rarely drops a pine cone below — leave room to catch it.",
  });

  await api.sprites.loadFromMod(SPRITE.sieve, "sieve.png");

  api.structures.register(
    {
      id: STRUCTURE.sieve,
      nameKey: SIEVE_I18N.name,
      descriptionKey: SIEVE_I18N.description,
      categoryKey: "production",
      order: 45,
      alwaysUnlocked: true,
      buildModes: [{ type: "single" }],
      variants: [{ id: STRUCTURE.sieve, angles: [0, 90, 180, 270] }],
      shape: sieveShape.map((row) => [...row]),
      useRawShape: true,
      render: {
        imageName: SPRITE.sieve,
        size: { width: 16, height: 16 },
        ui: { outline: false },
      },
    },
    { useRawShape: true },
  );

  api.structures.processing.register(SIEVE_PROCESSOR_ID, {
    structureType: STRUCTURE.sieve,
    intervalMs: SIEVE_PROCESS_INTERVAL_MS,
    process: processSieve,
  });

  unlockSieveForBuilding();
  api.events.on("game:ready", unlockSieveForBuilding);

  console.log(
    `loaded — ${STRUCTURE.sieve} every ${SIEVE_PROCESS_INTERVAL_MS}ms, pine cone chance ${SIEVE_PINE_CONE_CHANCE}`,
  );
}
