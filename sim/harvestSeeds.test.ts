import assert from "node:assert/strict";
import { test } from "node:test";
import { TRUNK_HEIGHT } from "./constants.ts";
import { canopyTipY } from "./canopy.ts";
import { collectLinkedNeedles, resolveHarvestSeedSlots } from "./harvestSeeds.ts";

test("resolveHarvestSeedSlots picks the mature canopy tip on the center column", () => {
  const rootX = 10;
  const rootY = 100;
  const tipY = canopyTipY(rootY, TRUNK_HEIGHT);
  const linkedNeedles = [
    { x: rootX, y: tipY },
    { x: rootX - 1, y: tipY + 2 },
    { x: rootX, y: tipY + 1 },
  ];
  const slots = resolveHarvestSeedSlots(rootX, rootY, linkedNeedles, false);
  assert.deepEqual([...slots], [`${rootX},${tipY}`]);
});

test("resolveHarvestSeedSlots falls back to topmost center needle when the tip is missing", () => {
  const rootX = 10;
  const rootY = 100;
  const linkedNeedles = [
    { x: rootX, y: 70 },
    { x: rootX, y: 68 },
    { x: 12, y: 60 },
  ];
  const slots = resolveHarvestSeedSlots(rootX, rootY, linkedNeedles, false);
  assert.deepEqual([...slots], ["10,68"]);
});

test("resolveHarvestSeedSlots falls back to topmost linked needle when center column is empty", () => {
  const rootX = 10;
  const rootY = 100;
  const linkedNeedles = [
    { x: 12, y: 70 },
    { x: 11, y: 65 },
  ];
  const slots = resolveHarvestSeedSlots(rootX, rootY, linkedNeedles, false);
  assert.deepEqual([...slots], ["11,65"]);
});

test("resolveHarvestSeedSlots adds the center row below on bonus roll", () => {
  const rootX = 10;
  const rootY = 100;
  const tipY = canopyTipY(rootY, TRUNK_HEIGHT);
  const linkedNeedles = [
    { x: rootX, y: tipY },
    { x: rootX, y: tipY + 1 },
    { x: rootX - 1, y: tipY + 1 },
  ];
  const slots = resolveHarvestSeedSlots(rootX, rootY, linkedNeedles, true);
  assert.deepEqual([...slots].sort(), [`${rootX},${tipY}`, `${rootX},${tipY + 1}`].sort());
});

test("resolveHarvestSeedSlots does not duplicate when bonus row equals primary", () => {
  const rootX = 10;
  const rootY = 100;
  const linkedNeedles = [{ x: rootX, y: 70 }];
  const slots = resolveHarvestSeedSlots(rootX, rootY, linkedNeedles, true);
  assert.deepEqual([...slots], ["10,70"]);
});

test("collectLinkedNeedles keeps needles whose root column is in the collapsed trunk", () => {
  const wood = new Set(["2,10", "3,10", "4,10"]);
  const needles = new Map([
    ["2,4", 3],
    ["4,4", 3],
    ["8,4", 99],
  ]);
  const { linkedNeedles } = collectLinkedNeedles(3, 12, {
    isPineWood: (cellX, cellY) => wood.has(`${cellX},${cellY}`),
    isNeedle: (cellX, cellY) => needles.has(`${cellX},${cellY}`),
    needleRootX: (cellX, cellY) => needles.get(`${cellX},${cellY}`) ?? cellX,
    needleRootY: () => 12,
  });
  assert.deepEqual(linkedNeedles.map((cell) => `${cell.x},${cell.y}`).sort(), ["2,4", "4,4"]);
});
