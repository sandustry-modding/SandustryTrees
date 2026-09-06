import { treesLiveConfig } from "./config.ts";
import { registerWorker as registerPineConeWorker } from "./tree/pine/pineCone/worker.ts";
import { registerWorker as registerPineShootWorker } from "./tree/pine/pineShoot/worker.ts";
import { registerWorker as registerPineNeedleWorker } from "./tree/pine/pineNeedle/worker.ts";
import { registerWorker as registerPineWoodWorker } from "./tree/pine/pineWood/worker.ts";
import { registerWorker as registerAcornWorker } from "./tree/oak/acorn/worker.ts";
import { registerWorker as registerOakShootWorker } from "./tree/oak/oakShoot/worker.ts";
import { registerWorker as registerOakLeafWorker } from "./tree/oak/oakLeaf/worker.ts";
import { registerWorker as registerOakWoodWorker } from "./tree/oak/oakWood/worker.ts";
import { registerWorker as registerWoodWorker } from "./wood/worker.ts";
import { registerWorker as registerCompostWorker } from "./compost/worker.ts";
import type { HarvestTypes } from "./tree/pine/pineWood/collapse.ts";
import type { HarvestTypes as OakHarvestTypes } from "./tree/oak/oakWood/collapse.ts";
import type { BurnTypes } from "./wood/burn.ts";
import { ELEMENT, TERRAIN, VANILLA_ELEMENT } from "./shared/ids.ts";

const workerApi = sandkit.api as unknown as WorkerSandkitApi;
treesLiveConfig.get();
treesLiveConfig.listen(workerApi);

function resolveTypes(api: WorkerSandkitApi): HarvestTypes {
  return {
    pineWood: api.terrains.getTypeById(TERRAIN.pineWood),
    pineNeedle: api.elements.getTypeById(ELEMENT.pineNeedle),
    pineShoot: api.elements.getTypeById(ELEMENT.pineShoot),
    pineCone: api.elements.getTypeById(ELEMENT.pineCone),
    wood: api.elements.getTypeById(ELEMENT.wood),
    compost: api.elements.getTypeById(ELEMENT.compost),
  };
}

function resolveOakTypes(api: WorkerSandkitApi): OakHarvestTypes {
  return {
    oakWood: api.terrains.getTypeById(TERRAIN.oakWood),
    oakLeaf: api.elements.getTypeById(ELEMENT.oakLeaf),
    oakShoot: api.elements.getTypeById(ELEMENT.oakShoot),
    acorn: api.elements.getTypeById(ELEMENT.acorn),
    wood: api.elements.getTypeById(ELEMENT.wood),
    compost: api.elements.getTypeById(ELEMENT.compost),
  };
}

function resolveBurnTypes(api: WorkerSandkitApi): BurnTypes {
  return {
    wood: api.elements.getTypeById(ELEMENT.wood),
    charcoal: api.elements.getTypeById(ELEMENT.charcoal),
    flame: sandkit.enums.ElementType.Flame,
  };
}

let booted = false;

function boot(): void {
  if (booted) return;
  const types = resolveTypes(workerApi);
  const oak = resolveOakTypes(workerApi);
  registerPineConeWorker(workerApi, {
    pineCone: types.pineCone,
    pineShoot: types.pineShoot,
    water: sandkit.enums.ElementType.Water,
  });
  registerPineShootWorker(workerApi, types);
  registerPineNeedleWorker(workerApi, {
    pineNeedle: types.pineNeedle,
    fire: sandkit.enums.ElementType.Fire,
    flame: sandkit.enums.ElementType.Flame,
    burntResidue: workerApi.elements.getTypeById(VANILLA_ELEMENT.burntResidue),
  });
  registerPineWoodWorker(workerApi, types);
  registerAcornWorker(workerApi, {
    acorn: oak.acorn,
    oakShoot: oak.oakShoot,
    water: sandkit.enums.ElementType.Water,
  });
  registerOakShootWorker(workerApi, oak);
  registerOakLeafWorker(workerApi, {
    oakLeaf: oak.oakLeaf,
    fire: sandkit.enums.ElementType.Fire,
    flame: sandkit.enums.ElementType.Flame,
    burntResidue: workerApi.elements.getTypeById(VANILLA_ELEMENT.burntResidue),
  });
  registerOakWoodWorker(workerApi, oak);
  registerWoodWorker(workerApi, resolveBurnTypes(workerApi));
  registerCompostWorker(workerApi, {
    compost: types.compost,
    wetCompost: workerApi.elements.getTypeById(ELEMENT.wetCompost),
    water: sandkit.enums.ElementType.Water,
  });
  booted = true;
}

try {
  boot();
} catch {
  workerApi.events.on("worker:update:post", () => {
    try {
      boot();
    } catch {
      /* main registration may still be in flight */
    }
  });
}
