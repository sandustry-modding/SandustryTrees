import assert from "node:assert/strict";
import test from "node:test";
import { treesConfigDefaults as d } from "../config.ts";

test("sieve tuning stays bootstrap-grade", () => {
  assert.equal(d.sieveWidth, 4);
  assert.equal(d.sieveHeight, 1);
  assert.ok(d.sieveProcessIntervalMs >= 1500);
  assert.ok(d.sievePineConeChance > 0 && d.sievePineConeChance <= 0.02);
});
