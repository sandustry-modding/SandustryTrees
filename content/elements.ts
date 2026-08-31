import { ELEMENT, NAME_KEY, VANILLA_ELEMENT } from "../shared/ids.ts";

const MatterType = sandkit.enums.MatterType;

type LiveRegister = Parameters<typeof sandkit.api.elements.register>[0] & {
  interactions?: readonly { kind: string; structures?: readonly string[] }[];
  isGrabbable?: boolean;
  isTransportable?: boolean;
  metaColor?: number;
  flammable?: {
    outputElementId?: string;
    outputChance?: number;
    static?: boolean;
    duration?: number | readonly [number, number];
  };
};

function definition(partial: LiveRegister): LiveRegister {
  return partial;
}

const ELEMENT_DEFINITIONS: LiveRegister[] = [
  definition({
    id: ELEMENT.pineSeed,
    nameKey: NAME_KEY.pineSeed,
    density: 90,
    matterType: MatterType.Powder,
    metaColor: 0x6b4226,
    isGrabbable: true,
    isTransportable: true,
    colors: {
      variants: [
        [107, 66, 38],
        [92, 54, 30],
        [130, 82, 48],
      ],
    },
  }),
  definition({
    id: ELEMENT.pineShoot,
    nameKey: NAME_KEY.pineShoot,
    density: 160,
    matterType: MatterType.Static,
    metaColor: 0x5c3a21,
    isGrabbable: true,
    isTransportable: true,
    colors: {
      variants: [
        [92, 58, 33],
        [74, 46, 26],
        [110, 70, 40],
      ],
    },
    defaultDataFields: { field1: 0, field2: 0, field3: 1, field4: 1 },
  }),
  definition({
    id: ELEMENT.pineNeedle,
    nameKey: NAME_KEY.pineNeedle,
    density: 40,
    matterType: MatterType.Static,
    metaColor: 0x2f5a32,
    colors: {
      variants: [
        [47, 90, 50],
        [36, 72, 40],
        [62, 110, 58],
      ],
    },
    defaultDataFields: { field1: 0, field2: 0 },
  }),
  definition({
    id: ELEMENT.rawWood,
    nameKey: NAME_KEY.rawWood,
    density: 120,
    matterType: MatterType.Solid,
    metaColor: 0xb07a48,
    isGrabbable: true,
    isTransportable: true,
    interactions: [{ kind: "flammable" }],
    flammable: { outputElementId: VANILLA_ELEMENT.burntResidue, outputChance: 1 },
    defaultDataFields: { field1: 0 },
    colors: {
      variants: [
        [176, 122, 72],
        [150, 98, 56],
        [196, 140, 88],
      ],
    },
  }),
  definition({
    id: ELEMENT.charcoal,
    nameKey: NAME_KEY.charcoal,
    density: 200,
    matterType: MatterType.Solid,
    metaColor: 0x2a2a2a,
    isGrabbable: true,
    isTransportable: true,
    colors: {
      variants: [
        [42, 42, 42],
        [28, 28, 28],
        [58, 54, 50],
      ],
    },
  }),
  definition({
    id: ELEMENT.leafDust,
    nameKey: NAME_KEY.leafDust,
    density: 55,
    matterType: MatterType.Powder,
    metaColor: 0x6b7a3a,
    isGrabbable: true,
    isTransportable: true,
    colors: {
      variants: [
        [107, 122, 58],
        [90, 104, 46],
        [128, 138, 72],
      ],
    },
    defaultDataFields: { field1: 0 },
  }),
];

const api = sandkit.api;

export function registerElements(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineSeed]: "Pine Seed",
    [NAME_KEY.pineShoot]: "Pine Shoot",
    [NAME_KEY.pineWood]: "Pine Wood",
    [NAME_KEY.pineNeedle]: "Pine Needle",
    [NAME_KEY.rawWood]: "Raw Wood",
    [NAME_KEY.charcoal]: "Charcoal",
    [NAME_KEY.leafDust]: "Leaf Dust",
  });

  for (const item of ELEMENT_DEFINITIONS) {
    const { elementType } = api.elements.register(
      item as Parameters<typeof api.elements.register>[0],
    );
    if (item.flammable) {
      api.elements.addInteractionInfo(elementType, { kind: "flammable" });
      api.elements.updateDefinition(elementType, {
        flammable: item.flammable,
      } as Parameters<typeof api.elements.updateDefinition>[1]);
    }
    api.discoveries.addElementByType(elementType);
  }
}
