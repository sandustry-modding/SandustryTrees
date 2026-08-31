import { isEnabled } from "@modkit/utils";
import { registerElements } from "./registry/elements.ts";
import { registerTerrains } from "./registry/terrains.ts";

const api = sandkit.api;

if (isEnabled(api)) {
  registerElements();
  registerTerrains();
}
