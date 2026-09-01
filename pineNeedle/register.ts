import { ELEMENT, NAME_KEY } from "../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineNeedle]: "Pine Needle"
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
        [62, 110, 58]
      ]
    }
  });
  api.discoveries.addElementByType(elementType);
}
