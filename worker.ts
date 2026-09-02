import { registerWorker as registerPineConeWorker } from "./pineCone/worker.ts";
import { registerWorker as registerPineShootWorker } from "./pineShoot/worker.ts";
import { registerWorker as registerPineNeedleWorker } from "./pineNeedle/worker.ts";
import { registerWorker as registerPineWoodWorker } from "./pineWood/worker.ts";
import { registerWorker as registerWoodWorker } from "./wood/worker.ts";
import type { HarvestTypes } from "./pineWood/collapse.ts";
import type { BurnTypes } from "./wood/burn.ts";
import { ELEMENT, TERRAIN, VANILLA_ELEMENT } from "./shared/ids.ts";

const workerApi = sandkit.api as unknown as WorkerSandkitApi;

function resolveTypes(api: WorkerSandkitApi): HarvestTypes {
  return {
    pineWood: api.terrains.getTypeById(TERRAIN.pineWood),
    pineNeedle: api.elements.getTypeById(ELEMENT.pineNeedle),
    pineShoot: api.elements.getTypeById(ELEMENT.pineShoot),
    pineCone: api.elements.getTypeById(ELEMENT.pineCone),
    wood: api.elements.getTypeById(ELEMENT.wood),
    leafDust: api.elements.getTypeById(ELEMENT.leafDust),
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
  registerWoodWorker(workerApi, resolveBurnTypes(workerApi));
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
