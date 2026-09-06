import { modinfo } from "../modinfo.ts";

const root = modinfo.id;

const ns = `${root}:`;
const key = `${root}:`;

export const ELEMENT = {
  pineCone: ns + "pineCone",
  pineShoot: ns + "pineShoot",
  pineNeedle: ns + "pineNeedle",
  acorn: ns + "acorn",
  oakShoot: ns + "oakShoot",
  oakLeaf: ns + "oakLeaf",
  wood: ns + "wood",
  charcoal: ns + "charcoal",
  compost: ns + "compost",
  wetCompost: ns + "wetCompost",
} as const;

export const NAME_KEY = {
  pineCone: key + "pineCone.name",
  pineShoot: key + "pineShoot.name",
  pineNeedle: key + "pineNeedle.name",
  pineWood: key + "pineWood.name",
  acorn: key + "acorn.name",
  oakShoot: key + "oakShoot.name",
  oakLeaf: key + "oakLeaf.name",
  oakWood: key + "oakWood.name",
  wood: key + "wood.name",
  charcoal: key + "charcoal.name",
  compost: key + "compost.name",
  wetCompost: key + "wetCompost.name",
} as const;

export const VANILLA_ELEMENT = {
  burntResidue: "burntResidue",
  water: "water",
} as const;

export const TERRAIN = {
  pineWood: ns + "pineWood",
  oakWood: ns + "oakWood",
} as const;

export const STRUCTURE = {
  sieve: ns + "sieve",
} as const;

export const SPRITE = {
  sieve: ns + "sieve-sprite",
} as const;
