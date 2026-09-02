import { ELEMENT } from "../shared/ids.ts";
import {
  SIEVE_HEIGHT,
  SIEVE_PINE_CONE_CHANCE,
  SIEVE_WIDTH,
} from "./constants.ts";

const api = sandkit.api;
const { ElementType } = sandkit.enums;

export function processSieve(
  structure: { x: number; y: number; queued?: boolean },
  context: {
    getResolvedTypeAtCell: (cellX: number, cellY: number) => number | null;
    isCellEmptyAtCell: (cellX: number, cellY: number) => boolean;
  },
): void {
  if (structure.queued) return;

  const intakeY = structure.y - 1;
  let intakeX = -1;

  for (let dx = 0; dx < SIEVE_WIDTH; dx += 1) {
    const cellX = structure.x + dx;
    if (context.getResolvedTypeAtCell(cellX, intakeY) === ElementType.Sand) {
      intakeX = cellX;
      break;
    }
  }

  if (intakeX < 0) return;

  api.elements.removeAtCell(intakeX, intakeY);

  if (api.random.float(0, 1) >= SIEVE_PINE_CONE_CHANCE) return;

  const pineConeType = api.elements.getTypeById(ELEMENT.pineCone);
  if (pineConeType == null) return;

  const outX = structure.x + Math.floor(SIEVE_WIDTH / 2);
  const outY = structure.y + SIEVE_HEIGHT;
  if (!context.isCellEmptyAtCell(outX, outY)) return;

  api.elements.createAtCell(outX, outY, pineConeType);
}
