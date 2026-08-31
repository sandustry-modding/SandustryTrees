import { SEED_COUNT_MAX } from "../grow/constants.ts";
import { seedCountAfterMerge } from "../grow/size.ts";
import { SEED_ABSORB_RADIUS, SEED_ABSORB_WAIT_TICKS } from "./constants.ts";

/** Cell offsets in the absorb window centered on the root (default 7×7). */
export function absorbCellOffsets(radius = SEED_ABSORB_RADIUS): { dx: number; dy: number }[] {
  const cells: { dx: number; dy: number }[] = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      cells.push({ dx, dy });
    }
  }
  return cells;
}

/** True when the shoot is still waiting for nearby seeds (negative trunk-height field). */
export function isAbsorbWaiting(progress: number): boolean {
  return progress < 0;
}

export function absorbWaitRemaining(progress: number): number {
  return isAbsorbWaiting(progress) ? -progress : 0;
}

/** Initial shoot progress: negative wait ticks before trunk growth. */
export function initialAbsorbProgress(waitTicks = SEED_ABSORB_WAIT_TICKS): number {
  return -Math.max(1, waitTicks);
}

/**
 * After one absorb tick: reset wait if a seed was taken, else count down.
 * Returns the next progress value (still negative while waiting, or `1` when ready to grow).
 */
export function nextAbsorbProgress(
  progress: number,
  absorbedAny: boolean,
  waitTicks = SEED_ABSORB_WAIT_TICKS,
): number {
  if (absorbedAny) return initialAbsorbProgress(waitTicks);
  const left = progress + 1;
  return left < 0 ? left : 1;
}

export function nextSeedCountFromPositions(
  seedCount: number,
  rootX: number,
  seeds: readonly { x: number }[],
): number {
  let count = seedCount;
  for (const seed of seeds) {
    if (count >= SEED_COUNT_MAX) break;
    count = seedCountAfterMerge(count, rootX, seed.x);
  }
  return count;
}
