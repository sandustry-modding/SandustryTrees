import { ELEMENT, NAME_KEY } from "../shared/ids.ts";

const api = sandkit.api;

export function registerElements(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineCone]: "Pine Cone",
  });

  const { elementType } = api.elements.register({
    id: ELEMENT.pineCone,
    nameKey: NAME_KEY.pineCone,
    density: 90,
    matterType: sandkit.enums.MatterType.Powder,
    colors: {
      variants: [
        [107, 66, 38],
        [92, 54, 30],
        [130, 82, 48],
      ],
    },
    isGrabbable: true,
    isTransportable: true,
  });

  api.discoveries.addElementByType(elementType);
}
