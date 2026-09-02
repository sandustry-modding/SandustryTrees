import { ELEMENT, NAME_KEY, VANILLA_ELEMENT } from "../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineShoot]: "Pine Shoot",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.pineShoot,
    nameKey: NAME_KEY.pineShoot,
    density: 160,
    matterType: sandkit.enums.MatterType.Static,
    metaColor: 0x5c3a21,
    colors: {
      variants: [
        [92, 58, 33],
        [74, 46, 26],
        [110, 70, 40],
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
