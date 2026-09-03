import { isEnabled } from "@modkit/utils";
import { register as registerPineCone } from "./tree/pine/pineCone/register.ts";
import { registerMain as registerPineConeMain } from "./tree/pine/pineCone/main.ts";
import { register as registerPineShoot } from "./tree/pine/pineShoot/register.ts";
import { registerMain as registerPineShootMain } from "./tree/pine/pineShoot/main.ts";
import { register as registerPineNeedle } from "./tree/pine/pineNeedle/register.ts";
import { registerMain as registerPineNeedleMain } from "./tree/pine/pineNeedle/main.ts";
import { register as registerWood } from "./wood/register.ts";
import { register as registerCharcoal } from "./charcoal/register.ts";
import { register as registerCompost } from "./compost/register.ts";
import { register as registerPineWood } from "./tree/pine/pineWood/register.ts";
import { registerMain as registerPineWoodMain } from "./tree/pine/pineWood/main.ts";
import { registerSieve } from "./sieve/register.ts";

const api = sandkit.api;

if (isEnabled(api)) {
  registerPineCone();
  registerPineShoot();
  registerPineNeedle();
  registerWood();
  registerCharcoal();
  registerCompost();
  registerPineWood();
  registerPineConeMain();
  registerPineShootMain();
  registerPineNeedleMain();
  registerPineWoodMain();
  void registerSieve();
}
