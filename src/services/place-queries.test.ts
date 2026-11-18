// @vitest-environment node
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import type { Query } from "@/lib/db";
import { selectPlaceRowBySlug, selectPublishedPlaceRows } from "./place-queries";
import { mapPlaceRow } from "./place-rows";

const db = new PGlite();
const query: Query = async <T>(text: string, params: unknown[] = []) => (await db.query<T>(text, params)).rows;

beforeAll(async () => {
  const migrations = join(process.cwd(), "db", "migrations");
  for (const file of (await readdir(migrations)).sort()) await db.exec(await readFile(join(migrations, file), "utf8"));
  // Las mismas columnas que escribe scripts/importar-espacios.mjs.
  await db.exec(`
    insert into public.places (slug, name, type, summary, description, address, phone, opening_hours, social_links, services, main_image_path, gallery_paths, latitude, longitude, status) values
      ('casa-historica', 'Casa Histórica', 'museum', 'Donde se declaró la Independencia.', 'Primer párrafo.' || chr(10) || chr(10) || 'Segundo párrafo.',
       'Congreso de Tucumán 141', null, '{"lineas": ["Martes a viernes: 9 a 13 h"]}', '{"instagram": "https://www.instagram.com/casahistorica.ar/"}', '{}',
       '/media/lugares/casa-historica/portada.jpg', '{/media/lugares/casa-historica/1.jpg,/media/lugares/casa-historica/2.jpg}', -26.830600, -65.203800, 'published'),
      ('teatro-rosita-avila', 'Teatro Rosita Ávila', 'theater', 'Teatro municipal.', null, 'Las Piedras 1500', '+54 381 420-0338', '{}', '{}', '{}', null, '{}', null, null, 'published'),
      ('plaza-urquiza', 'Plaza Urquiza', 'square', 'Plaza.', null, null, null, '{}', '{}', '{}', null, '{}', null, null, 'published'),
      ('sala-nueva', 'Sala nueva', 'theater', 'Todavía en borrador.', null, null, null, '{}', '{}', '{}', null, '{}', null, null, 'draft');
  `);
});

describe("selectPublishedPlaceRows", () => {
  it("filters by type and leaves drafts out", async () => {
    const slugs = (await selectPublishedPlaceRows(query, ["museum", "theater"])).map((row) => row.slug).sort();
    expect(slugs).toEqual(["casa-historica", "teatro-rosita-avila"]);
  });

  it("maps JSON, arrays and numerics the way the pages use them", async () => {
    const [row] = await selectPublishedPlaceRows(query, ["museum"]);
    expect(mapPlaceRow(row)).toMatchObject({
      name: "Casa Histórica",
      description: "Primer párrafo.\n\nSegundo párrafo.",
      openingHours: ["Martes a viernes: 9 a 13 h"],
      socialLinks: { instagram: "https://www.instagram.com/casahistorica.ar/" },
      imageUrl: "/media/lugares/casa-historica/portada.jpg",
      gallery: ["/media/lugares/casa-historica/1.jpg", "/media/lugares/casa-historica/2.jpg"],
      latitude: -26.8306,
    });
  });

  it("fills empty values for places loaded with defaults", async () => {
    const [row] = await selectPublishedPlaceRows(query, ["square"]);
    expect(mapPlaceRow(row)).toMatchObject({ address: "", openingHours: [], socialLinks: {}, gallery: [], imageUrl: undefined });
  });
});

describe("selectPlaceRowBySlug", () => {
  it("finds published places only", async () => {
    expect((await selectPlaceRowBySlug(query, "teatro-rosita-avila"))?.phone).toBe("+54 381 420-0338");
    expect(await selectPlaceRowBySlug(query, "sala-nueva")).toBeNull();
    expect(await selectPlaceRowBySlug(query, "no-existe")).toBeNull();
  });
});
