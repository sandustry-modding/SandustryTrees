/** PineNeedle rows on the upper trunk for one seed (upper ~60%). */
export const CANOPY_ROWS = 42;

/** Extra needle rows per extra trunk half-width. */
export const CANOPY_ROWS_PER_EXTRA_HALF = 12;

/** Needles on each side of the trunk at the bottom of the canopy for one seed. */
export const CANOPY_MAX_HALF_WIDTH = 18;

/** Extra canopy half-width per extra trunk half-width. */
export const CANOPY_HALF_PER_EXTRA_HALF = 9;

/** Cells above the top trunk row where the needle tip sits. One cell is 4 pixels. */
export const CANOPY_TIP_OFFSET_CELLS = 12;

/** Trunk cells that must exist before needles spawn. Stops a green tuft on the soil. */
export const CANOPY_MIN_TRUNK_HEIGHT = 24;
