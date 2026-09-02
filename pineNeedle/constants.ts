/** Trunk cells that must exist before needles spawn. */
export const CANOPY_MIN_TRUNK_HEIGHT = 32;

/** Needle rows above the shoot so the green tip sits in front of the brown shoot. */
export const CANOPY_LEAD = 3;

/** Needles on each side of the center at the base of the cone. */
export const CANOPY_MAX_HALF = 8;

/** Chance a burning needle leaves Burnt Residue. */
export const NEEDLE_BURN_RESIDUE_CHANCE = 0.02;

/** Chance a fire cell lights one neighboring needle, each update. */
export const NEEDLE_IGNITE_CHANCE = 0.03;
