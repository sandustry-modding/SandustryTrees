# Trees

Pine and oak trees, harvested wood, and charcoal for Sandustry.

## Use

1. Enable the mod and load a save.
2. **Debug menu:** equip the Debug tool → **Element** brush → **Pine Cone** or **Acorn**.
3. Rest a Pine Cone **on Dirt**, then touch it with **Water**. The water is consumed and the cone becomes a **Pine Shoot**. The dirt stays. The shoot waits about **12 ticks** and pulls other Pine Seeds from a **7×7** window around the root. Each absorbed seed resets that wait. Then the pine grows as a sapling: the trunk rises first, then a needle cone at the crown. One seed makes a **72-cell** trunk that starts 1 cell wide and thickens to 5 cells at the base, with a large needle cone. Each extra seed adds **24 cells** of height (up to 8 seeds). The trunk gets wider up to 11 cells. The needle cone gets larger with the trunk. Seeds that plant inside the window while the tree grows still merge in.
4. Needles start after 24 trunk cells. The cone stays on the crown and gets wider as the tree grows. Needles fill empty cells only. They do not replace terrain or other elements. Needles that you remove do not grow back. Grab **Pine Needle** cells with the grabber to turn them into **Compost**. Fire burns needles. Nearby fire or flame lights one neighboring needle at a time. The fire crawls through the canopy, like oil. Most cells leave nothing. A few cells leave **Burnt Residue**. The mature tip sits 12 cells above the wood. The shoot stays on the trunk until the tree is full height. You can grab the **Pine Shoot** with the grabber, the same way as a Pine Seed. If you take the shoot, the tree stops growing. Fire burns the shoot to **Burnt Residue**. When the trunk is full height, one needle becomes a **Pine Cone**. A second needle becomes a Pine Cone 1% of the time.
5. **Oak:** rest an **Acorn** on Dirt and touch it with Water (same plant rule as a pine cone).
   The oak shoot grows a shorter trunk (about **48** cells) that starts 1 cell wide and becomes thicker than pine.
   The main trunk splits into two crown leaders.
   Overlapping leaf clumps fill the crown, including the crotch.
   Grab **Oak Leaf** cells for the same **Compost**.
   Fire crawls through oak leaves the same way as needles.
   A finished oak replaces one leaf with an Acorn (1% chance of a second).
   The Sand Sieve does not drop acorns.
6. Mine any **trunk** cell with a shovel or drill. The rest of the trunk falls as **Raw Wood**. Needles and oak leaves fall as **Compost**. One **Pine Seed** drops from a pine canopy tip (rarely two). One **Acorn** drops from a finished oak (rarely two).
7. Burn **Raw Wood** in open air to make vanilla **burnt residue**. Seal a pile (no empty cells in the 8 neighbors) to make **Charcoal**. Sealed fire stays lit for about 2 seconds per cell and crawls through the pile.
8. Dry **Compost** stays a powder until it cannot fall or slide. After about **60 ticks** at rest, **Water** that touches it is consumed and the cell becomes **Wet Compost** (denser). A moving pile does not wet. Wet Compost must stay at rest about **180 ticks**, then each cell waits a **random** extra time before it becomes **Dirt**. A whole pile turns gradually. If a cell moves, its wait starts again.

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

- **Mod enabled** — turn pine trees, oak trees, wood, and charcoal off.

## Runtime config

Turn on **F3 debug overlay** in Dev Tools options.
Press **F3**.
Pick **Trees**.
Change a field.
**Reset** restores defaults.

The same values live on `globalThis.irishbruseTrees` (see `config.ts`).
Growth, burn, compost, and sieve process read the live object.

```js
irishbruseTrees.debug = true;
irishbruseTrees.oakTrunkHeight = 36;
```

The sim worker has its own `globalThis`.
`worker.ts` copies F3 edits from the shared buffer.
Densities, sieve shape, and sieve interval apply when the mod loads.

## Dev

```bash
npm run dev -- --mod trees
npm run test:integration irishbruse.trees
```

Hard-reload Sandustry after the bundle writes.

## Code layout

Edit the folder for the feature you want to change.
Tunable numbers live in `config.ts` and on `globalThis.irishbruseTrees`.
Event names and data-field indexes stay in that folder's `constants.ts`.

| Folder                  | What to edit                        |
| ----------------------- | ----------------------------------- |
| `config.ts`             | Tunable numbers, `irishbruseTrees`  |
| `tree/pine/pineCone/`   | Cone on dirt + water → shoot        |
| `tree/pine/pineShoot/`  | Pine growth and sapling shape       |
| `tree/pine/pineNeedle/` | Needle cone fill and burn           |
| `tree/pine/pineWood/`   | Living trunk, harvest, collapse     |
| `tree/oak/acorn/`       | Acorn on dirt + water → oak shoot   |
| `tree/oak/oakShoot/`    | Oak growth and sapling shape        |
| `tree/oak/oakLeaf/`     | Crown branches, leaf tufts, burn    |
| `tree/oak/oakWood/`     | Living oak trunk, harvest, collapse |
| `wood/`                 | Harvested wood kiln                 |
| `charcoal/`             | Charcoal element                    |
| `compost/`              | Compost, wet compost, dirt settle   |
| `sieve/`                | Sand Sieve (sand → rare pine cone)  |
| `tests/`                | Chromium integration tests          |
| `shared/`               | Cell args, ids, data fields         |

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
