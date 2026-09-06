import { ELEMENT, NAME_KEY, VANILLA_ELEMENT } from "../../../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.oakShoot]: "Oak Shoot",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.oakShoot,
    nameKey: NAME_KEY.oakShoot,
    density: 160,
    matterType: sandkit.enums.MatterType.Static,
    metaColor: 0x6b4a28,
    colors: {
      variants: [
        [102, 68, 38],
        [86, 54, 32],
        [118, 78, 48],
      ],
    },
    isGrabbable: true,
    isTransportable: false,
  });
  api.elements.addInteractionInfo(elementType, { kind: "flammable" });
  api.elements.updateDefinition(elementType, {
    flammable: { outputElementId: VANILLA_ELEMENT.burntResidue, outputChance: 1 },
  } as Parameters<typeof api.elements.updateDefinition>[1]);
  api.discoveries.addElementByType(elementType);
}
