import { NAME_KEY, TERRAIN } from "../shared/ids.ts";

const api = sandkit.api;

export function registerTerrains(): void {
  api.i18n.register("en", {
    [NAME_KEY.pineWood]: "Pine Wood"
  });

  const { cellType } = api.terrains.register({
    id: TERRAIN.pineWood,
    nameKey: NAME_KEY.pineWood,
    hp: 5,
    colorHSL: [25, 50, 32],
    metaColor: 0x5c3a21
  });

  api.discoveries.addTerrainByType(cellType);
}
