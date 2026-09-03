import { ELEMENT, NAME_KEY } from "../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.compost]: "Compost",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.compost,
    nameKey: NAME_KEY.compost,
    density: 55,
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
  });
  api.discoveries.addElementByType(elementType);
}
