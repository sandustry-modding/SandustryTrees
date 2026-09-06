# Changelog

## Unreleased

- Added: **Water** turns settled **Compost** into denser **Wet Compost**. A cell must be unable to fall or slide, then wait about 60 ticks. Wet Compost must stay at rest about 180 ticks, then each cell waits a random extra time before it becomes **Dirt**, so a pile turns gradually.
- Fixed: dirt from Wet Compost is placed in the same sim tick as the powder is removed, so a pile does not leave empty holes. Nearby shadows still redraw on the main thread.
- Fixed: new and removed **Pine Wood** redraws nearby shadows the same way, so a trunk is not split by a stuck shadow.
- Fixed: chopping the base of a pine trunk collapses the tree again. Main-thread harvest reads still saw the removed cell as trunk until mutate applied, so the tree looked attached to dirt.
- Fixed: detached trunk collapse finishes in the same harvest instead of stopping after the first batch. Main-thread harvest collapses the whole detached trunk in one mutate pass.
- Changed: living pine tree code lives under `tree/pine/`. Wood, charcoal, compost, and the sieve stay at the mod root.
- Fixed: the shoot grows through its own needles, so the trunk can reach full height.
- Changed: pine growth no longer refills the whole canopy or flood-collapses the tree on every row. That was stalling the sim.
- Added: **Sand Sieve** production structure. It slowly consumes dry sand from above and very rarely drops a pine cone below. Find it under **Building → Production** after a hard reload.
- Added: the Pine Shoot is flammable. It burns to Burnt Residue.
- Added: a finished pine replaces one canopy needle with a Pine Cone. It replaces a second needle 1% of the time.
- Added: pine needles burn. They usually leave nothing. They rarely leave a little Burnt Residue. Nearby fire lights one needle at a time, slowly, the way oil fire crawls.
- Changed: **Leaf Dust** is now **Compost**. Grab needles or drop a canopy to get Compost.
- Changed: the needle canopy fills empty cells only. It does not replace terrain or other elements.
- Changed: pine cones plant when they sit **on Dirt** and touch **Water**. The water is consumed. Trees stay attached to Dirt.
