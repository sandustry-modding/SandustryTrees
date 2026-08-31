import { modinfo } from "../modinfo.ts";

const root = modinfo.id;

export const ELEMENT = {
  pineCone: `${root}:pineCone`,
} as const;

export const NAME_KEY = {
  pineCone: `${root}.pineCone.name`,
} as const;
