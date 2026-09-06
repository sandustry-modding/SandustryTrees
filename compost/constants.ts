export const COMPOST_DENSITY = 55;
export const WET_COMPOST_DENSITY = 90;

/** Ticks dry compost must sit still before water can wet it. */
export const SETTLE_DURATION_TICKS = 60;

/** Ticks wet compost must sit still before it rolls a dirt wait. */
export const DIRT_IDLE_BEFORE_RANDOM_TICKS = 180;

/** Inclusive extra idle ticks after the min rest, before dirt. */
export const DIRT_SETTLE_MIN_TICKS = 48;
export const DIRT_SETTLE_MAX_TICKS = 320;

/** Data field 1: ticks spent settled. */
export const IDLE_FIELD = 1;

/** Data field 2: rolled dirt wait, or 0 before the first idle roll. */
export const DIRT_WAIT_FIELD = 2;

/** Cells around new dirt to redraw so terrain shadows catch up. */
export const DIRT_SHADOW_REDRAW_RANGE = 24;
