import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TREES_CONFIG_GLOBAL,
  config,
  treesConfig,
  treesConfigDefaults,
  trunkGrowRowsPerTick,
  type TreesConfig,
} from "./config.ts";

type TreesGlobal = typeof globalThis & {
  [TREES_CONFIG_GLOBAL]?: Partial<TreesConfig> | TreesConfig;
};

function host(): TreesGlobal {
  return globalThis as TreesGlobal;
}

test("treesConfig installs defaults on the global", () => {
  delete host()[TREES_CONFIG_GLOBAL];
  const live = treesConfig();
  assert.equal(live.oakTrunkHeight, treesConfigDefaults.oakTrunkHeight);
  assert.equal(host()[TREES_CONFIG_GLOBAL], live);
});

test("config mutations write through the global", () => {
  treesConfig().oakTrunkHeight = treesConfigDefaults.oakTrunkHeight;
  config.oakTrunkHeight = 20;
  assert.equal(host()[TREES_CONFIG_GLOBAL]?.oakTrunkHeight, 20);
  assert.equal(config.oakTrunkHeight, 20);
  config.oakTrunkHeight = treesConfigDefaults.oakTrunkHeight;
});

test("replacing the global overlays defaults", () => {
  host()[TREES_CONFIG_GLOBAL] = { debug: true, oakTrunkHeight: 12 };
  const live = treesConfig();
  assert.equal(live.debug, true);
  assert.equal(live.oakTrunkHeight, 12);
  assert.equal(live.pineTrunkHeight, treesConfigDefaults.pineTrunkHeight);
  live.debug = false;
  live.oakTrunkHeight = treesConfigDefaults.oakTrunkHeight;
});

test("trunkGrowRowsPerTick follows debug", () => {
  config.debug = false;
  assert.equal(trunkGrowRowsPerTick(), 1);
  config.debug = true;
  assert.equal(trunkGrowRowsPerTick(), config.debugTrunkGrowRowsPerTick);
  config.debug = false;
});
