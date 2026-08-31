import { modinfo } from "../modinfo.ts";

const root = modinfo.id;

export const ELEMENT = {
  pineCone: `${root}:pineCone`,
  pineShoot: `${root}:pineShoot`
} as const;

export const NAME_KEY = {
  pineCone: `${root}.pineCone.name`,
  pineShoot: `${root}.pineShoot.name`,
  pineWood: `${root}.pineWood.name`
} as const;

export const TERRAIN = {
  pineWood: `${root}:pineWood`
} as const;
