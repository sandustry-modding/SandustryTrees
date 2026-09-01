import { ELEMENT, NAME_KEY } from "../shared/ids.ts";

const api = sandkit.api;

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.charcoal]: "Charcoal",
  });
  const { elementType } = api.elements.register({
    id: ELEMENT.charcoal,
    nameKey: NAME_KEY.charcoal,
    density: 200,
    matterType: sandkit.enums.MatterType.Solid,
    metaColor: 0x2a2a2a,
    colors: {
      variants: [
        [42, 42, 42],
        [28, 28, 28],
        [58, 54, 50],
      ],
    },
    isGrabbable: true,
    isTransportable: true,
  });
  api.discoveries.addElementByType(elementType);
}
