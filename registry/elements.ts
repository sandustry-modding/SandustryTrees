import { ELEMENT, NAME_KEY } from "../shared/ids.ts";

const api = sandkit.api;

export function registerElements(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineCone]: "Pine Cone",
    [NAME_KEY.pineShoot]: "Pine Shoot",
    [NAME_KEY.pineNeedle]: "Pine Needle",
    [NAME_KEY.wood]: "Wood",
    [NAME_KEY.leafDust]: "Leaf Dust"
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
    isGrabbable: true,
    isTransportable: false
  });

  const needle = api.elements.register({
    id: ELEMENT.pineNeedle,
    nameKey: NAME_KEY.pineNeedle,
    density: 40,
    matterType: sandkit.enums.MatterType.Static,
    colors: {
      variants: [
        [47, 90, 50],
        [36, 72, 40],
        [62, 110, 58]
      ]
    }
  });

  const wood = api.elements.register({
    id: ELEMENT.wood,
    nameKey: NAME_KEY.wood,
    density: 120,
    matterType: sandkit.enums.MatterType.Solid,
    colors: {
      variants: [
        [176, 122, 72],
        [150, 98, 56],
        [196, 140, 88]
      ]
    },
    isGrabbable: true,
    isTransportable: true
  });

  const leafDust = api.elements.register({
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

  api.discoveries.addElementByType(cone.elementType);
  api.discoveries.addElementByType(shoot.elementType);
  api.discoveries.addElementByType(needle.elementType);
  api.discoveries.addElementByType(wood.elementType);
  api.discoveries.addElementByType(leafDust.elementType);
}
