import { ELEMENT, NAME_KEY, VANILLA_ELEMENT } from "../shared/ids.ts";
import { NEEDLE_BURN_RESIDUE_CHANCE } from "./constants.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineNeedle]: "Pine Needle",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.pineNeedle,
    nameKey: NAME_KEY.pineNeedle,
    density: 40,
    matterType: sandkit.enums.MatterType.Static,
    metaColor: 0x2f5a32,
    colors: {
      variants: [
        [47, 90, 50],
        [36, 72, 40],
        [62, 110, 58],
      ],
    },
    isGrabbable: false,
    isTransportable: false,
    interactions: [{ kind: "flammable" }],
    flammable: {
      outputElementId: VANILLA_ELEMENT.burntResidue,
      outputChance: NEEDLE_BURN_RESIDUE_CHANCE,
    },
  } as Parameters<typeof api.elements.register>[0]);
  api.elements.addInteractionInfo(elementType, { kind: "flammable" });
  api.elements.updateDefinition(elementType, {
    flammable: {
      outputElementId: VANILLA_ELEMENT.burntResidue,
      outputChance: NEEDLE_BURN_RESIDUE_CHANCE,
    },
  } as Parameters<typeof api.elements.updateDefinition>[1]);
  api.discoveries.addElementByType(elementType);
}
