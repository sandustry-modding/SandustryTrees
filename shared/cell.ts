export type Cell = { x: number; y: number };

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function xyFromUnknown(value: unknown): Cell | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { x?: unknown; y?: unknown };
  const x = asNumber(record.x);
  const y = asNumber(record.y);
  if (x === null || y === null) return null;
  return { x, y };
}

export function cellFromArgs(args: Record<string, unknown>): Cell | null {
  const x = asNumber(args.x) ?? asNumber(args.cellX);
  const y = asNumber(args.y) ?? asNumber(args.cellY);
  if (x !== null && y !== null) return { x, y };
  return xyFromUnknown(args.position);
}

export function xyFromValue(value: unknown): Cell | null {
  return xyFromUnknown(value);
}
