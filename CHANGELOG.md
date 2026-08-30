# Changelog

## Unreleased

- Changed: planting a Pine Seed does not dry the Wet Sand.
- Changed: you can grab a Pine Shoot with the grabber, the same way as a Pine Seed.
- Changed: open-air Raw Wood burns to burnt residue. Sealed Raw Wood (no empty 8-neighbors) becomes a static flame for about 2 seconds, then Charcoal. Sealed fire crawls to one sealed neighbor at a time.
- Changed: the trunk grows through its own needles so a pine can reach full height. Merged seeds still make a wider, taller tree.
- Changed: Pine Seeds rest on wet sand and plant instead of sinking through it.
- Changed: one seed grows the old 48-cell pine with the old needle cone.
- Changed: extra seeds next to a growing pine merge into that tree. Each extra seed adds 16 cells of height. The trunk gets wider until half-width 4. The needle cone gets larger with the trunk.
- Changed: needles that you remove do not grow back. The tree only adds new needle cells when the trunk grows.
- Added: mining a pine trunk drops one Pine Seed from the canopy tip. There is a 1% chance for a second seed one row below.

## 0.1.10

- Changed: needles wait until the trunk is 16 cells tall. The cone stays on the crown. Old needles below the cone are removed, so they do not sit on the soil.

## 0.1.9

- Changed: the needle cone sits 8 cells above the top of the trunk (was 3).

## 0.1.8

- Changed: pines grow as saplings. Trunk and needles rise together. The cone gets taller and wider until full height.

## 0.1.7

- Changed: the trunk and needles grow one row per tick. The shoot stays on the trunk. Needles spawn above the wood and never replace pine wood terrain.

## 0.1.6

- Changed: pine wood terrain uses a 4×4 brown grain instead of one flat color.

## 0.1.5

- Changed: the needle cone starts 6 cells above the trunk. Needles grow 4 rows per tick.

## 0.1.4

- Changed: the needle tip sits 3 cells (12 pixels) above the top of the trunk.

## 0.1.3

- Changed: trunk growth is faster for testing. The canopy grows one needle row at a time.

## 0.1.2

- Changed: the pine trunk is 3 cells wide.

## 0.1.1

- Changed: the pine trunk is terrain. Mine it with a shovel or drill. The rest of the tree falls as raw wood.

## 0.1.0

- Added: pine seeds grow on wet sand into a 48-cell tree with a wide needle canopy.
- Added: cut the base trunk to drop raw wood. Needles drop leaf dust that composts into dirt.
- Added: sealed burning raw wood turns into charcoal. Open flame still burns to ash.
