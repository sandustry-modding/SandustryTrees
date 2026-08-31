import { ELEMENT, NAME_KEY } from "../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.leafDust]: "Leaf Dust"
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.leafDust,
    nameKey: NAME_KEY.leafDust,
    density: 55,
    matterType: sandkit.enums.MatterType.Powder,
    colors: {
      variants: [
        [107, 122, 58],
        [90, 104, 46],
        [128, 138, 72]
      ]
    },
    isGrabbable: true,
    isTransportable: true
  });
  api.discoveries.addElementByType(elementType);
}
