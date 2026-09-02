import assert from "node:assert/strict";
import test from "node:test";
import {
  SIEVE_HEIGHT,
  SIEVE_PINE_CONE_CHANCE,
  SIEVE_PROCESS_INTERVAL_MS,
  SIEVE_WIDTH,
} from "./constants.ts";

test("sieve tuning stays bootstrap-grade", () => {
  assert.equal(SIEVE_WIDTH, 4);
  assert.equal(SIEVE_HEIGHT, 1);
  assert.ok(SIEVE_PROCESS_INTERVAL_MS >= 1500);
  assert.ok(SIEVE_PINE_CONE_CHANCE > 0 && SIEVE_PINE_CONE_CHANCE <= 0.02);
});
