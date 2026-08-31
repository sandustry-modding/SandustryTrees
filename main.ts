import { isEnabled } from "@modkit/utils";
import { registerSpawnCone } from "./debug/spawnCone.ts";
import { registerHarvest } from "./harvest/main.ts";
import { registerElements } from "./registry/elements.ts";
import { registerTerrains } from "./registry/terrains.ts";

const api = sandkit.api;

if (isEnabled(api)) {
  registerElements();
  registerTerrains();
  registerHarvest();
  registerSpawnCone();
}
