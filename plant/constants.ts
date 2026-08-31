/** Half-size of the seed absorb window around the root. Total window is `(2 * r + 1)^2` (7×7). */
export const SEED_ABSORB_RADIUS = 3;

/**
 * Ticks to wait after the last absorbed seed before the trunk grows.
 * Each absorbed seed resets this timer so late seeds still merge.
 * Negative `field3` on the shoot stores the remaining wait (`-ticksLeft`).
 */
export const SEED_ABSORB_WAIT_TICKS = 12;
