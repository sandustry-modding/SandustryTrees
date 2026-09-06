import { modinfo } from "../modinfo.ts";

const root = modinfo.id;

function ns(test: string) {
  return `${root}:${test}`;
}

function key(test: string) {
  return `${root}.${test}`;
}

export const ELEMENT = {
  pineCone: ns("pineCone"),
  pineShoot: ns("pineShoot"),
  pineNeedle: ns("pineNeedle"),
  wood: ns("wood"),
  charcoal: ns("charcoal"),
  compost: ns("compost"),
  wetCompost: ns("wetCompost"),
} as const;

export const NAME_KEY = {
  pineCone: key("pineCone.name"),
  pineShoot: key("pineShoot.name"),
  pineNeedle: key("pineNeedle.name"),
  pineWood: key("pineWood.name"),
  wood: key("wood.name"),
  charcoal: key("charcoal.name"),
  compost: key("compost.name"),
  wetCompost: key("wetCompost.name"),
} as const;

export const VANILLA_ELEMENT = {
  burntResidue: "burntResidue",
  water: "water",
} as const;

export const TERRAIN = {
  pineWood: ns("pineWood"),
} as const;

export const STRUCTURE = {
  sieve: ns("sieve"),
} as const;

export const SPRITE = {
  sieve: ns("sieve-sprite"),
} as const;
