import { ELEMENT, NAME_KEY, TERRAIN } from "../../../shared/ids.ts";

const api = sandkit.api;

const GRAIN_HUE = [28, 30, 26, 32, 29, 31, 28, 32];
const GRAIN_SAT = [46, 40, 50, 44, 48, 38, 50, 42];
const GRAIN_LITE = [32, 46, 22, 52, 34, 42, 24, 48];

function oakWoodGrain(): [number, number, number][][] {
  return GRAIN_LITE.map((_, row) =>
    GRAIN_LITE.map((base, col) => {
      const jitter = ((col * 7 + row * 3) % 7) - 3;
      return [GRAIN_HUE[col], GRAIN_SAT[col], Math.max(20, Math.min(56, base + jitter))];
    })
  );
}

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.oakWood]: "Oak Wood"
  });

  const colorsHSL = oakWoodGrain();
  const woodType = api.elements.getTypeById(ELEMENT.wood);
  const { cellType } = api.terrains.register({
    id: TERRAIN.oakWood,
    nameKey: NAME_KEY.oakWood,
    hp: 5,
    colorHSL: [30, 46, 38],
    metaColor: 0x6b4a28,
    colorPattern: {
      size: [colorsHSL[0].length, colorsHSL.length],
      colorsHSL
    },
    output: { elementType: woodType, chance: 1 }
  });

  api.discoveries.addTerrainByType(cellType);
}
