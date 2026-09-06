import { config } from "../../../config.ts";
import { ELEMENT, NAME_KEY, VANILLA_ELEMENT } from "../../../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.oakLeaf]: "Oak Leaf",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.oakLeaf,
    nameKey: NAME_KEY.oakLeaf,
    density: 40,
    matterType: sandkit.enums.MatterType.Static,
    metaColor: 0x3d8c45,
    colors: {
      variants: [
        [61, 140, 69],
        [45, 122, 58],
        [88, 168, 82],
      ],
    },
    isGrabbable: false,
    isTransportable: false,
    interactions: [{ kind: "flammable" }],
    flammable: {
      outputElementId: VANILLA_ELEMENT.burntResidue,
      outputChance: config.oakLeafBurnResidueChance,
    },
  } as Parameters<typeof api.elements.register>[0]);
  api.elements.addInteractionInfo(elementType, { kind: "flammable" });
  api.elements.updateDefinition(elementType, {
    flammable: {
      outputElementId: VANILLA_ELEMENT.burntResidue,
      outputChance: config.oakLeafBurnResidueChance,
    },
  } as Parameters<typeof api.elements.updateDefinition>[1]);
  api.discoveries.addElementByType(elementType);
}
