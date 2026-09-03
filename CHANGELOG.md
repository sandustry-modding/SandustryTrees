# Changelog

## Unreleased

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
