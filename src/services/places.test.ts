import { describe, expect, it } from "vitest";
import aireLibre from "../../db/contenido/espacios-al-aire-libre.json";
import contenido from "../../db/contenido/espacios-culturales.json";
import { CULTURAL_PLACE_TYPES, getPlaceBySlug, getPlaces, groupPlacesByType, OUTDOOR_PLACE_TYPES } from "./places";

const todos = [...contenido.espacios, ...aireLibre.espacios];

describe("surveyed places content", () => {
  it("keeps every entry complete and with valid slugs", () => {
    for (const espacio of todos) {
      expect(espacio.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(espacio.name.length).toBeGreaterThan(2);
      expect(espacio.summary.length).toBeGreaterThan(20);
      expect(espacio.image).toMatch(/^https:\/\/agendaculturalsmt\.com\/wp-content\/uploads\//);
      if (espacio.latitude !== null) {
        // Dentro del ejido de San Miguel de Tucumán (el aeropuerto queda afuera y no es un lugar).
        expect(espacio.latitude).toBeGreaterThan(-26.9);
        expect(espacio.latitude).toBeLessThan(-26.75);
        expect(espacio.longitude).toBeGreaterThan(-65.3);
        expect(espacio.longitude).toBeLessThan(-65.15);
      }
    }
    for (const espacio of contenido.espacios) {
      expect(espacio.description.length).toBeGreaterThan(0);
      expect(CULTURAL_PLACE_TYPES).toContain(espacio.type);
    }
    for (const espacio of aireLibre.espacios) {
      expect(OUTDOOR_PLACE_TYPES).toContain(espacio.type);
      expect(espacio.latitude).not.toBeNull();
    }
    expect(new Set(todos.map((e) => e.slug)).size).toBe(todos.length);
  });
});

describe("demo mode", () => {
  it("lists the surveyed spaces sorted by name and grouped by type", async () => {
    const places = await getPlaces(CULTURAL_PLACE_TYPES);
    expect(places).toHaveLength(contenido.espacios.length);
    expect(places.map((p) => p.name)).toEqual([...places.map((p) => p.name)].sort((a, b) => a.localeCompare(b, "es-AR")));
    expect(groupPlacesByType(places, CULTURAL_PLACE_TYPES).map((group) => group.label)).toEqual(["Museos", "Teatros", "Centros culturales", "Otros espacios"]);
  });

  it("lists parks and plazas apart from the cultural spaces", async () => {
    const places = await getPlaces(OUTDOOR_PLACE_TYPES);
    expect(places).toHaveLength(aireLibre.espacios.length);
    expect(groupPlacesByType(places, OUTDOOR_PLACE_TYPES).map((group) => group.label)).toEqual(["Parques", "Plazas"]);
  });

  it("finds surveyed spaces and the demo places events point to", async () => {
    expect((await getPlaceBySlug("casa-historica"))?.address).toBe("Congreso de Tucumán 141");
    const parque = await getPlaceBySlug("parque-avellaneda");
    expect(parque).toMatchObject({ type: "park", address: "", latitude: -26.826759, longitude: -65.224554 });
    expect(await getPlaceBySlug("espacio-cultural-demo")).not.toBeNull();
    expect(await getPlaceBySlug("no-existe")).toBeNull();
  });
});
