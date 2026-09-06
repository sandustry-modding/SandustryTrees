import { config } from "../../../config.ts";
import { trunkRowHalfWidth } from "../../../shared/trunkWidth.ts";

/** Extra half-width at the root for this trunk height. */
export function trunkBaseExtraHalf(placedHeight: number): number {
  const t = Math.min(1, placedHeight / config.pineTrunkHeight);
  const span = 1 - config.pineTrunkBaseGrowStart;
  const delayed = span <= 0 ? t : Math.max(0, (t - config.pineTrunkBaseGrowStart) / span);
  return Math.round(delayed * (config.pineTrunkBaseMaxHalf - config.pineTrunkHalfWidth));
}

/** Half-width of a bole row, counting up from the root. */
export function trunkHalfWidthFromRoot(
  dyFromRoot: number,
  extraHalf: number,
  placedHeight: number,
): number {
  return trunkRowHalfWidth({
    dyFromRoot,
    placedHeight,
    heightMax: config.pineTrunkHeight,
    midHalfMax: config.pineTrunkHalfWidth,
    extraHalf,
    flareRows: config.pineTrunkBaseFlareRows,
    taperRows: config.pineTrunkTaperRows,
  });
}

/** Half-width of the new tip row at this sapling height. */
export function trunkHalfWidthAt(placedHeight: number): number {
  return trunkHalfWidthFromRoot(
    Math.max(0, placedHeight - 1),
    trunkBaseExtraHalf(placedHeight),
    placedHeight,
  );
}
