import { isEnabled } from "@modkit/utils";
import { registerElements } from "./content/elements.ts";

const api = sandkit.api;

if (isEnabled(api)) {
  registerElements();
}
