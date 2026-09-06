/** Mid-trunk half-width for this sapling height. Starts at 0 (1-wide). */
export function trunkMidHalf(placedHeight: number, heightMax: number, midHalfMax: number): number {
  if (heightMax <= 0) return midHalfMax;
  const t = Math.min(1, Math.max(0, placedHeight / heightMax));
  return Math.round(t * midHalfMax);
}

/** Half-width of one bole row for the current sapling height. */
export function trunkRowHalfWidth(args: {
  dyFromRoot: number;
  placedHeight: number;
  heightMax: number;
  midHalfMax: number;
  extraHalf: number;
  flareRows: number;
  taperRows: number;
}): number {
  const mid = trunkMidHalf(args.placedHeight, args.heightMax, args.midHalfMax);
  let half = mid;
  if (args.extraHalf > 0 && args.dyFromRoot < args.flareRows) {
    const span = Math.max(1, args.flareRows - 1);
    half = mid + Math.round((1 - args.dyFromRoot / span) * args.extraHalf);
  }
  const fromTop = args.placedHeight - 1 - args.dyFromRoot;
  if (fromTop < args.taperRows) {
    const span = Math.max(1, args.taperRows - 1);
    half = Math.round((Math.max(0, fromTop) / span) * half);
  }
  return half;
}
