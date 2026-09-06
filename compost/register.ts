import { ELEMENT, NAME_KEY } from "../shared/ids.ts";
import { COMPOST_DENSITY, WET_COMPOST_DENSITY } from "./constants.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.compost]: "Compost",
    [NAME_KEY.wetCompost]: "Wet Compost",
  });
  const dry = api.elements.register({
    id: ELEMENT.compost,
    nameKey: NAME_KEY.compost,
    density: COMPOST_DENSITY,
    matterType: sandkit.enums.MatterType.Powder,
    metaColor: 0x6b7a3a,
    colors: {
      variants: [
        [107, 122, 58],
        [90, 104, 46],
        [128, 138, 72],
      ],
    },
    isGrabbable: true,
    isTransportable: true,
    defaultDataFields: { field1: 0 },
  });
  api.discoveries.addElementByType(dry.elementType);

  const wet = api.elements.register({
    id: ELEMENT.wetCompost,
    nameKey: NAME_KEY.wetCompost,
    density: WET_COMPOST_DENSITY,
    matterType: sandkit.enums.MatterType.Powder,
    metaColor: 0x4a5c28,
    colors: {
      variants: [
        [74, 92, 40],
        [58, 74, 32],
        [90, 104, 48],
      ],
    },
    isGrabbable: true,
    isTransportable: true,
    defaultDataFields: { field1: 0, field2: 0 },
  });
  api.discoveries.addElementByType(wet.elementType);
}
