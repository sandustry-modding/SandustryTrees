/** Trunk cells that must exist before leaves and crown branches spawn. */
export const CANOPY_MIN_TRUNK_HEIGHT = 16;

/** Leaf rows above the shoot so the green tip sits in front of the brown shoot. */
export const CANOPY_LEAD = 3;

/** Leaf disk radius at each mature limb tip. */
export const LEAF_TIP_RADIUS = 5;

/** Trunk rows after a limb origin before that limb is full length. */
export const LIMB_GROW_ROWS = 8;

/** Chance a burning leaf leaves Burnt Residue. */
export const NEEDLE_BURN_RESIDUE_CHANCE = 0.02;

/** Chance a fire cell lights one neighboring leaf, each update. */
export const NEEDLE_IGNITE_CHANCE = 0.03;
