import { ELEMENT, NAME_KEY } from "../../../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.acorn]: "Acorn",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.acorn,
    nameKey: NAME_KEY.acorn,
    density: 90,
    matterType: sandkit.enums.MatterType.Powder,
    metaColor: 0x3d2414,
    colors: {
      variants: [
        [61, 36, 20],
        [48, 28, 14],
        [78, 48, 28],
      ],
    },
    isGrabbable: true,
    isTransportable: true,
  });
  api.discoveries.addElementByType(elementType);
}
