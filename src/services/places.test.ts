import { describe, expect, it } from "vitest";
import contenido from "../../db/contenido/espacios-culturales.json";
import { CULTURAL_PLACE_TYPES, getPlaceBySlug, getPlaces, groupPlacesByType } from "./places";

describe("cultural spaces content", () => {
  it("keeps every entry complete and with valid slugs", () => {
    for (const espacio of contenido.espacios) {
      expect(espacio.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(espacio.name.length).toBeGreaterThan(2);
      expect(espacio.summary.length).toBeGreaterThan(20);
      expect(espacio.description.length).toBeGreaterThan(0);
      expect(espacio.image).toMatch(/^https:\/\/agendaculturalsmt\.com\/wp-content\/uploads\//);
      expect(CULTURAL_PLACE_TYPES).toContain(espacio.type);
    }
    expect(new Set(contenido.espacios.map((e) => e.slug)).size).toBe(contenido.espacios.length);
  });
});

describe("demo mode", () => {
  it("lists the surveyed spaces sorted by name and grouped by type", async () => {
    const places = await getPlaces(CULTURAL_PLACE_TYPES);
    expect(places).toHaveLength(contenido.espacios.length);
    expect(places.map((p) => p.name)).toEqual([...places.map((p) => p.name)].sort((a, b) => a.localeCompare(b, "es-AR")));
    expect(groupPlacesByType(places, CULTURAL_PLACE_TYPES).map((group) => group.label)).toEqual(["Museos", "Teatros", "Centros culturales", "Otros espacios"]);
  });

  it("finds surveyed spaces and the demo places events point to", async () => {
    expect((await getPlaceBySlug("casa-historica"))?.address).toBe("Congreso de Tucumán 141");
    expect(await getPlaceBySlug("espacio-cultural-demo")).not.toBeNull();
    expect(await getPlaceBySlug("no-existe")).toBeNull();
  });
});
