/** Lowest detached pine-wood cells converted to falling Wood each tick. */
export const WOOD_COLLAPSE_PER_TICK = 3;

/** Cells around pine wood to redraw so terrain shadows catch up. */
export const PINE_WOOD_SHADOW_REDRAW_RANGE = 24;

/** Worker asks main to redraw terrain shadows around this cell. */
export const PINE_WOOD_SHADOW_EVENT = "irishbruse.trees:pineWood:shadow";
