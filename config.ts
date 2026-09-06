import { createLiveConfig } from "@modkit/utils/live-config";

export const TREES_CONFIG_GLOBAL = "irishbruseTrees";

export const treesConfigDefaults = {
  debug: false,
  debugTrunkGrowRowsPerTick: 12,

  pineTrunkHeight: 72,
  pineTrunkHalfWidth: 1,
  pineTrunkBaseMaxHalf: 2,
  pineTrunkBaseFlareRows: 12,
  pineTrunkBaseGrowStart: 0.45,
  pineTrunkTaperRows: 6,
  pineGrowDurationTicks: 1,
  pineCanopyMinTrunkHeight: 32,
  pineCanopyLead: 3,
  pineCanopyMaxHalf: 8,
  pineNeedleBurnResidueChance: 0.02,
  pineNeedleIgniteChance: 0.03,
  pineCanopySecondConeChance: 0.01,
  pineWoodCollapsePerTick: 3,
  pineWoodShadowRedrawRange: 24,

  oakTrunkHeight: 48,
  oakTrunkHalfWidth: 2,
  oakTrunkForkHeight: 34,
  oakTrunkBaseMaxHalf: 4,
  oakTrunkBaseFlareRows: 6,
  oakTrunkBaseGrowStart: 0.45,
  oakTrunkTaperRows: 6,
  oakGrowDurationTicks: 1,
  oakCanopyMinTrunkHeight: 16,
  oakCanopyLead: 3,
  oakLeafTipRadius: 8,
  oakLeafCrownRadius: 9,
  oakLimbGrowRows: 8,
  oakLimbOut: 7,
  oakLimbUp: 10,
  oakLeafBurnResidueChance: 0.02,
  oakLeafIgniteChance: 0.03,
  oakCanopySecondAcornChance: 0.01,
  oakWoodCollapsePerTick: 3,
  oakWoodShadowRedrawRange: 24,

  woodFlameDurationSec: 2,
  woodSpreadDelayTicks: 45,
  woodDensity: 120,

  compostDensity: 55,
  wetCompostDensity: 90,
  compostSettleDurationTicks: 60,
  dirtIdleBeforeRandomTicks: 180,
  dirtSettleMinTicks: 48,
  dirtSettleMaxTicks: 320,
  dirtShadowRedrawRange: 24,

  sieveWidth: 4,
  sieveHeight: 1,
  sieveProcessIntervalMs: 2000,
  sievePineConeChance: 0.01,
};

export type TreesConfig = typeof treesConfigDefaults;

export const treesLiveConfig = createLiveConfig({
  id: "irishbruse.trees",
  title: "Trees",
  globalKey: TREES_CONFIG_GLOBAL,
  defaults: treesConfigDefaults,
});

export const config = treesLiveConfig.config;

export function treesConfig(): TreesConfig {
  return treesLiveConfig.get();
}

export function trunkGrowRowsPerTick(): number {
  return config.debug ? config.debugTrunkGrowRowsPerTick : 1;
}
