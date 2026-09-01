import { ELEMENT, NAME_KEY, VANILLA_ELEMENT } from "../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.wood]: "Wood",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.wood,
    nameKey: NAME_KEY.wood,
    density: 120,
    matterType: sandkit.enums.MatterType.Solid,
    colors: {
      variants: [
        [176, 122, 72],
        [150, 98, 56],
        [196, 140, 88],
      ],
    },
    isGrabbable: true,
    isTransportable: true,
    defaultDataFields: { field1: 0 },
  });
  api.elements.addInteractionInfo(elementType, { kind: "flammable" });
  api.elements.updateDefinition(elementType, {
    flammable: { outputElementId: VANILLA_ELEMENT.burntResidue, outputChance: 1 },
  } as Parameters<typeof api.elements.updateDefinition>[1]);
  api.discoveries.addElementByType(elementType);
}
