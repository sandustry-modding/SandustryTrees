# Trees

Pine trees, harvested wood, and charcoal for Sandustry.

## Use

1. Enable the mod and load a save.
2. **Debug menu:** equip the Debug tool → **Element** brush → **Pine Cone**.
3. Touch a Pine Cone with **Water**. The water is consumed and the cone becomes a **Pine Shoot**. Plant next to **Dirt** so the tree stays rooted. The shoot waits about **12 ticks** and pulls other Pine Seeds from a **7×7** window around the root. Each absorbed seed resets that wait. Then the pine grows as a sapling: the trunk rises first, then a needle cone at the crown. One seed makes a **72-cell** trunk, 5 cells wide, with a large needle cone. Each extra seed adds **24 cells** of height (up to 8 seeds). The trunk gets wider up to 11 cells. The needle cone gets larger with the trunk. Seeds that plant inside the window while the tree grows still merge in.
4. Needles start after 24 trunk cells. The cone stays on the crown and gets wider as the tree grows. Needles fill empty cells only. They do not replace terrain or other elements. Needles that you remove do not grow back. Grab **Pine Needle** cells with the grabber to turn them into **Leaf Dust**. Fire burns needles. Nearby fire or flame lights one neighboring needle at a time. The fire crawls through the canopy, like oil. Most cells leave nothing. A few cells leave **Burnt Residue**. The mature tip sits 12 cells above the wood. The shoot stays on the trunk until the tree is full height. You can grab the **Pine Shoot** with the grabber, the same way as a Pine Seed. If you take the shoot, the tree stops growing. Fire burns the shoot to **Burnt Residue**. When the trunk is full height, one needle becomes a **Pine Cone**. A second needle becomes a Pine Cone 1% of the time.
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

No extra machines from vanilla. Use conveyors, sensors, drills, pistons, and hoppers.

- **Sand Sieve:** **Building** (Q) → **Production** → **Sand Sieve**. Place under a sand pile. It slowly eats dry sand from the row above. About **1%** of sand becomes a **Pine Cone** below the center. Leave empty space to catch cones. This is a slow bootstrap, not a farm.
- **Tree farm:** a sensor above a mature canopy fires a drill at the trunk. Catch falling Raw Wood in a hopper.
- **Kiln chute:** drop Raw Wood down a shaft. Spark at the intake. Keep the shaft sealed (no empty diagonal cells). Gate Charcoal onto a belt below.

## Options

- **Mod enabled** — turn pine trees, wood, and charcoal off.

## Dev

```bash
npm run dev -- --mod trees
```

Hard-reload Sandustry after the bundle writes.

## Code layout

Edit the folder for the feature you want to change. Numbers live in that folder's `constants.ts`.

| Folder | What to edit |
|---|---|
| `pineCone/` | Cone + water → shoot |
| `grow/` | Trunk height/width, growth ticks, size from seed count |
| `canopy/` | Needle cone shape and fill |
| `harvest/` | Mine trunk, drop wood/seeds, collapse |
| `burn/` | Charcoal kiln |
| `needles/` | Needle break, leaf-dust compost |
| `sieve/` | Sand Sieve structure (sand → rare pine cone) |
| `registry/` | Element and terrain register |
| `shared/` | Cell args, ids, data fields |
| `worker/` | Sim hook wiring |

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
