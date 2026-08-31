import { ELEMENT, NAME_KEY } from "../shared/ids.ts";

const api = sandkit.api;

export function registerElements(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineCone]: "Pine Cone",
    [NAME_KEY.pineShoot]: "Pine Shoot"
  });

  const cone = api.elements.register({
    id: ELEMENT.pineCone,
    nameKey: NAME_KEY.pineCone,
    density: 90,
    matterType: sandkit.enums.MatterType.Powder,
    colors: {
      variants: [
        [107, 66, 38],
        [92, 54, 30],
        [130, 82, 48]
      ]
    },
    isGrabbable: true,
    isTransportable: true
  });

  const shoot = api.elements.register({
    id: ELEMENT.pineShoot,
    nameKey: NAME_KEY.pineShoot,
    density: 160,
    matterType: sandkit.enums.MatterType.Static,
    colors: {
      variants: [
        [92, 58, 33],
        [74, 46, 26],
        [110, 70, 40]
      ]
    },
    isGrabbable: false,
    isTransportable: false
  });

  api.discoveries.addElementByType(cone.elementType);
  api.discoveries.addElementByType(shoot.elementType);
}
