/** Lowest detached oak-wood cells converted to falling Wood each tick. */
export const WOOD_COLLAPSE_PER_TICK = 3;

/** Cells around oak wood to redraw so terrain shadows catch up. */
export const OAK_WOOD_SHADOW_REDRAW_RANGE = 24;

/** Worker asks main to redraw terrain shadows around this cell. */
export const OAK_WOOD_SHADOW_EVENT = "irishbruse.trees:oakWood:shadow";
