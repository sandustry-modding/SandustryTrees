import { ELEMENT, NAME_KEY, TERRAIN } from "../../../shared/ids.ts";

const api = sandkit.api;

const GRAIN_HUE = [22, 26, 18, 28, 20, 24, 16, 30];
const GRAIN_SAT = [48, 42, 54, 46, 50, 40, 52, 44];
const GRAIN_LITE = [22, 36, 14, 42, 24, 32, 12, 38];

function pineWoodGrain(): [number, number, number][][] {
  return GRAIN_LITE.map((_, row) =>
    GRAIN_LITE.map((base, col) => {
      const jitter = ((col * 7 + row * 3) % 7) - 3;
      return [GRAIN_HUE[col], GRAIN_SAT[col], Math.max(10, Math.min(46, base + jitter))];
    }),
  );
}

export function register(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineWood]: "Pine Wood",
  });

  const colorsHSL = pineWoodGrain();
  const woodType = api.elements.getTypeById(ELEMENT.wood);
  const { cellType } = api.terrains.register({
    id: TERRAIN.pineWood,
    nameKey: NAME_KEY.pineWood,
    hp: 5,
    colorHSL: [25, 50, 32],
    metaColor: 0x5c3a21,
    colorPattern: {
      size: [colorsHSL[0].length, colorsHSL.length],
      colorsHSL,
    },
    output: { elementType: woodType, chance: 1 },
  });

  api.discoveries.addTerrainByType(cellType);
}
