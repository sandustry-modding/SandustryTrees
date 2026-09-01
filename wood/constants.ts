/** Static Flame lifetime on sealed Wood before Charcoal (seconds). */
export const WOOD_FLAME_DURATION_SEC: readonly [number, number] = [2, 2];

/** Ticks before a primed Wood neighbor ignites (crawl spread). */
export const WOOD_SPREAD_DELAY_TICKS = 45;

/** Engine skipPhysics value that pins Flame in place (static burn). */
export const PHYSICS_SKIP = 1;

/** Wood data field 1: 1 = scheduled to ignite from a burning neighbor. */
export const IGNITE_PRIME_FIELD = 1;

export const WOOD_DENSITY = 120;
