import { CANOPY_MIN_TRUNK_HEIGHT } from "./constants.ts";
import { canopyKeepCells, canopyNewCells, canopySearchHalf, canopyTipY, canopyTreeTopY } from "./shape.ts";
import { TRUNK_HEIGHT_MAX } from "../grow/constants.ts";
import { placeNeedleCell } from "../grow/place.ts";
import { FIELD } from "../shared/field.ts";
import type { TreeTypes } from "../shared/types.ts";

export function fillCanopy(
  api: WorkerSandkitApi,
  types: TreeTypes,
  rootX: number,
  rootY: number,
  height: number,
  previousHeight: number,
  targetHeight: number,
  halfWidth: number,
): void {
  const keep = canopyKeepCells(rootX, rootY, height, targetHeight, halfWidth);
  const keepKeys = new Set(keep.map((cell) => `${cell.x},${cell.y}`));
  const searchTop = canopyTipY(rootY, TRUNK_HEIGHT_MAX) - 1;
  const searchHalf = canopySearchHalf(halfWidth);
  const left = rootX - searchHalf;
  const right = rootX + searchHalf;
  for (let cellX = left; cellX <= right; cellX += 1) {
    for (let cellY = searchTop; cellY < rootY; cellY += 1) {
      if (!api.elements.isTypeAtCell(cellX, cellY, types.pineNeedle)) continue;
      if ((api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootX) ?? cellX) !== rootX) continue;
      if ((api.elements.getDataFieldAtCell(cellX, cellY, FIELD.rootY) ?? cellY) !== rootY) continue;
      if (keepKeys.has(`${cellX},${cellY}`)) continue;
      api.elements.removeAtCell(cellX, cellY);
    }
  }
  if (height < CANOPY_MIN_TRUNK_HEIGHT) return;
  for (const cell of canopyNewCells(
    rootX,
    rootY,
    height,
    previousHeight,
    targetHeight,
    halfWidth,
  )) {
    placeNeedleCell(api, types, cell.x, cell.y, rootX, rootY);
  }
}

export function finishCanopy(
  api: WorkerSandkitApi,
  types: TreeTypes,
  shootX: number,
  shootY: number,
  fields: { rootX: number; rootY: number; targetHeight: number },
): void {
  placeNeedleCell(
    api,
    types,
    fields.rootX,
    canopyTipY(fields.rootY, fields.targetHeight),
    fields.rootX,
    fields.rootY,
  );
  if (!api.elements.isTypeAtCell(shootX, shootY, types.pineShoot)) return;
  if (api.terrains.getTypeAtCell(shootX, shootY) === types.pineWood) {
    api.elements.removeAtCell(shootX, shootY);
    return;
  }
  if (shootY >= canopyTreeTopY(fields.rootY, fields.targetHeight)) {
    api.elements.removeAtCell(shootX, shootY);
    return;
  }
  api.elements.replaceAtCell(shootX, shootY, types.pineNeedle, {
    dataFields: { field1: fields.rootX, field2: fields.rootY },
  });
  api.grid.reportActivityAtCell(shootX, shootY);
}
