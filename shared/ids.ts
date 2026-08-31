import { modinfo } from "../modinfo.ts";

const root = modinfo.id;

export const ELEMENT = {
  pineCone: `${root}:pineCone`,
  pineShoot: `${root}:pineShoot`,
  pineNeedle: `${root}:pineNeedle`,
  wood: `${root}:wood`,
  leafDust: `${root}:leafDust`
} as const;

export const NAME_KEY = {
  pineCone: `${root}.pineCone.name`,
  pineShoot: `${root}.pineShoot.name`,
  pineNeedle: `${root}.pineNeedle.name`,
  pineWood: `${root}.pineWood.name`,
  wood: `${root}.wood.name`,
  leafDust: `${root}.leafDust.name`
} as const;

export const TERRAIN = {
  pineWood: `${root}:pineWood`
} as const;
