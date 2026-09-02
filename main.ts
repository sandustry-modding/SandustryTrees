import { isEnabled } from "@modkit/utils";
import { register as registerPineCone } from "./pineCone/register.ts";
import { registerMain as registerPineConeMain } from "./pineCone/main.ts";
import { register as registerPineShoot } from "./pineShoot/register.ts";
import { registerMain as registerPineShootMain } from "./pineShoot/main.ts";
import { register as registerPineNeedle } from "./pineNeedle/register.ts";
import { registerMain as registerPineNeedleMain } from "./pineNeedle/main.ts";
import { register as registerWood } from "./wood/register.ts";
import { register as registerCharcoal } from "./charcoal/register.ts";
import { register as registerLeafDust } from "./leafDust/register.ts";
import { register as registerPineWood } from "./pineWood/register.ts";
import { registerMain as registerPineWoodMain } from "./pineWood/main.ts";
import { registerSieve } from "./sieve/register.ts";

const api = sandkit.api;

if (isEnabled(api)) {
  registerPineCone();
  registerPineShoot();
  registerPineNeedle();
  registerWood();
  registerCharcoal();
  registerLeafDust();
  registerPineWood();
  registerPineConeMain();
  registerPineShootMain();
  registerPineNeedleMain();
  registerPineWoodMain();
  void registerSieve();
}
