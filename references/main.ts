import { isEnabled } from "@modkit/utils";
import { registerElements } from "./content/elements.ts";
import { registerTerrains } from "./content/terrains.ts";
import { registerHarvest } from "./harvest/main.ts";

const api = sandkit.api;

if (isEnabled(api)) {
  registerElements();
  const pineWoodType = registerTerrains();
  registerHarvest(pineWoodType);
  api.events.on("game:ready", () => {
    api.ui.toast("Trees — Debug → Element → Pine Seed", {});
  });
}

console.log("loaded");
