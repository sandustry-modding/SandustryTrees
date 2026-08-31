/** Static Flame lifetime on sealed Raw Wood before Charcoal (seconds). */
export const WOOD_FLAME_DURATION_SEC: readonly [number, number] = [2, 2];

/** Ticks before a primed Raw Wood neighbor ignites (crawl spread). */
export const WOOD_SPREAD_DELAY_TICKS = 45;

/** Engine skipPhysics value that pins Flame in place (static burn). */
export const PHYSICS_SKIP = 1;
