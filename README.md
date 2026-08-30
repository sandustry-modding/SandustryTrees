# Trees

Pine trees, harvested wood, and charcoal for Sandustry.

## Use

1. Enable the mod and load a save.
2. **Debug menu:** equip the Debug tool → **Element** brush → **Pine Seed**.
3. Drop a seed onto **Wet Sand**. The wet sand stays wet. A pine grows as a sapling: the trunk rises first, then a needle cone at the crown. One seed makes a **48-cell** trunk, 3 cells wide, with the old needle cone. Extra seeds that land next to that tree **merge** into it. Each extra seed adds **16 cells** of height (up to 8 seeds). The trunk gets wider up to 9 cells. The needle cone gets larger with the trunk.
4. Needles start after 16 trunk cells. The cone stays on the crown and gets wider as the tree grows. Needles that you remove do not grow back. The mature tip sits 8 cells above the wood. The shoot stays on the trunk until the tree is full height. You can grab the **Pine Shoot** with the grabber, the same way as a Pine Seed. If you take the shoot, the tree stops growing.
5. Mine any **trunk** cell with a shovel or drill. The rest of the trunk falls as **Raw Wood**. Needles fall as **Leaf Dust**. One **Pine Seed** drops from the canopy tip (rarely two).
6. Burn **Raw Wood** in open air to make vanilla **burnt residue**. Seal a pile (no empty cells in the 8 neighbors) to make **Charcoal**. Sealed fire stays lit for about 2 seconds per cell and crawls through the pile.
7. Leaf Dust that rests in place becomes **Dirt**.

Old trees from 0.1.0 are static elements. Plant a new seed after you reload.

## Kiln (manual)

1. Pile Raw Wood on a floor.
2. Ignite it with a flamethrower or spark.
3. Cover every neighbor, including diagonals, with sand, soil, or other solids.
4. Wait for the sealed flame to crawl through the pile. Each sealed cell becomes Charcoal after about 2 seconds.
5. Dig the pile. Harvest Charcoal.

## Factory (vanilla parts)

No extra machines. Use conveyors, sensors, drills, pistons, and hoppers.

- **Tree farm:** a sensor above a mature canopy fires a drill at the trunk. Catch falling Raw Wood in a hopper.
- **Kiln chute:** drop Raw Wood down a shaft. Spark at the intake. Keep the shaft sealed (no empty diagonal cells). Gate Charcoal onto a belt below.

## Options

- **Mod enabled** — turn pine trees, wood, and charcoal off.

## Dev

```bash
npm run dev -- --mod trees
```

Hard-reload Sandustry after the bundle writes.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
