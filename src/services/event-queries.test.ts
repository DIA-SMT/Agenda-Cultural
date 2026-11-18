// @vitest-environment node
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import type { Query } from "@/lib/db";
import { selectEventRowBySlug, selectUpcomingEventRows } from "./event-queries";
import { mapEventRow } from "./event-rows";

// Corre las migraciones y el seed reales en un PostgreSQL embebido, así el SQL se prueba de verdad.
const db = new PGlite();
const query: Query = async <T>(text: string, params: unknown[] = []) => (await db.query<T>(text, params)).rows;

const fixtures = `
  insert into public.places (name, slug, status, address) values
    ('Teatro San Martín', 'teatro-san-martin', 'published', 'Av. Sarmiento 601'),
    ('Sala en obra', 'sala-en-obra', 'draft', 'Pendiente');
  insert into public.categories (name, slug, status) values ('Borrador', 'borrador', 'draft');

  insert into public.events (title, slug, place_id, custom_place_name, access_type, status) values
    ('Muestra en curso', 'muestra-en-curso', (select id from public.places where slug = 'teatro-san-martin'), null, 'free', 'published'),
    ('Función pasada', 'funcion-pasada', null, 'Plaza Independencia', 'paid', 'published'),
    ('Sólo cancelada', 'solo-cancelada', null, 'Plaza Urquiza', 'free', 'published'),
    ('En borrador', 'en-borrador', null, 'Parque 9 de Julio', 'free', 'draft'),
    ('Lugar sin publicar', 'lugar-sin-publicar', (select id from public.places where slug = 'sala-en-obra'), null, 'check', 'published');

  insert into public.event_categories (event_id, category_id) values
    ((select id from public.events where slug = 'muestra-en-curso'), (select id from public.categories where slug = 'borrador')),
    ((select id from public.events where slug = 'muestra-en-curso'), '10000000-0000-0000-0000-000000000003');

  insert into public.event_occurrences (event_id, starts_at, ends_at, status) values
    ((select id from public.events where slug = 'muestra-en-curso'), now() - interval '10 days', now() + interval '20 days', 'scheduled'),
    ((select id from public.events where slug = 'funcion-pasada'), now() - interval '2 days', now() - interval '2 days' + interval '2 hours', 'scheduled'),
    ((select id from public.events where slug = 'solo-cancelada'), now() + interval '5 days', null, 'cancelled'),
    ((select id from public.events where slug = 'en-borrador'), now() + interval '5 days', null, 'scheduled'),
    ((select id from public.events where slug = 'lugar-sin-publicar'), now() + interval '1 day', null, 'scheduled');
`;

beforeAll(async () => {
  const migrations = join(process.cwd(), "db", "migrations");
  for (const file of (await readdir(migrations)).sort()) await db.exec(await readFile(join(migrations, file), "utf8"));
  await db.exec(await readFile(join(process.cwd(), "db", "seed.sql"), "utf8"));
  await db.exec(fixtures);
});

describe("selectUpcomingEventRows", () => {
  it("returns only published events with pending, non-cancelled dates", async () => {
    const slugs = (await selectUpcomingEventRows(query, new Date())).map((row) => row.slug).sort();
    expect(slugs).toEqual(["encuentro-cultural-demo", "lugar-sin-publicar", "muestra-en-curso"]);
  });

  it("nests place, published categories and occurrences in the shape the mapper expects", async () => {
    const rows = await selectUpcomingEventRows(query, new Date());
    const seeded = mapEventRow(rows.find((row) => row.slug === "encuentro-cultural-demo")!);
    expect(seeded.place).toMatchObject({ slug: "espacio-cultural-demo", name: "Espacio cultural de demostración" });
    expect(seeded.categories.map((category) => category.slug)).toEqual(["musica"]);
    expect(seeded.occurrences).toHaveLength(2);
    expect(Date.parse(seeded.occurrences[0].startsAt)).toBeLessThan(Date.parse(seeded.occurrences[1].startsAt));

    const ongoing = mapEventRow(rows.find((row) => row.slug === "muestra-en-curso")!);
    expect(ongoing.categories.map((category) => category.slug)).toEqual(["talleres"]);
    expect(ongoing.place.address).toBe("Av. Sarmiento 601");
  });

  it("hides unpublished places behind the custom-place fallback", async () => {
    const rows = await selectUpcomingEventRows(query, new Date());
    expect(mapEventRow(rows.find((row) => row.slug === "lugar-sin-publicar")!).place.name).toBe("Lugar a confirmar");
  });

  it("drops dates that ended before the given moment", async () => {
    const inThreeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    expect(await selectUpcomingEventRows(query, inThreeMonths)).toEqual([]);
  });
});

describe("selectEventRowBySlug", () => {
  it("keeps past events reachable", async () => {
    const row = await selectEventRowBySlug(query, "funcion-pasada");
    expect(mapEventRow(row!).place.name).toBe("Plaza Independencia");
  });

  it("does not expose drafts or events without valid dates", async () => {
    expect(await selectEventRowBySlug(query, "en-borrador")).toBeNull();
    expect(await selectEventRowBySlug(query, "solo-cancelada")).toBeNull();
    expect(await selectEventRowBySlug(query, "no-existe")).toBeNull();
  });
});
