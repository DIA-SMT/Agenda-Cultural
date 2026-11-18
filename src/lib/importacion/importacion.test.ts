// @vitest-environment node
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import contenido from "../../../db/contenido/espacios-culturales.json";
import muestra from "./__fixtures__/eventon-muestra.json";
import { writePlan, type ImportDb } from "./escribir.mjs";
import { buildPlan, categoryName, htmlToParagraphs, summarize, type EventOnInstance, type ImportPlan, type WpEvent } from "./eventon.mjs";

// Muestra real del sitio anterior (scripts/importar-eventos.mjs la baja entera): un evento por cada caso difícil.
const terms = [
  { id: 120, slug: "musica", name: "Música" }, { id: 254, slug: "musica", name: "Música" },
  { id: 129, slug: "teatro", name: "Teatro" }, { id: 172, slug: "arte", name: "Arte" },
  { id: 187, slug: "danza", name: "Danza" }, { id: 302, slug: "pintura", name: "Pintura" },
  { id: 278, slug: "ferias-gastronomicas", name: "Ferias gastronómicas" },
  { id: 281, slug: "ferias-emprendedores", name: "Ferias emprendedores," },
];
const places = contenido.espacios.map(({ slug, name }) => ({ slug, name }));
const plan = buildPlan({
  wpEvents: muestra.wpEvents as WpEvent[],
  instances: muestra.instances as EventOnInstance[],
  cardsHtml: muestra.cardsHtml,
  terms,
  places,
});
const legacy = (id: number) => plan.events.find((event) => event.legacyId === String(id))!;

const hourInTucuman = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", { timeZone: "America/Argentina/Tucuman", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

describe("mapping EventON events", () => {
  it("keeps every event with its WordPress id, slug and old URL", () => {
    expect(plan.events).toHaveLength(muestra.wpEvents.length);
    expect(legacy(4446)).toMatchObject({ slug: "encuentro-coral", legacyUrl: expect.stringContaining("/events/encuentro-coral/") });
  });

  it("starts every first date at the hour typed in the old panel, even for events left in UTC", () => {
    for (const event of plan.events) {
      const first = muestra.instances
        .filter((instance) => String(instance.ID) === event.legacyId)
        .sort((a, b) => a.unix_start - b.unix_start)[0];
      const typed = `${first.event_pmv._start_hour?.[0]}:${first.event_pmv._start_minute?.[0]}`;
      expect(hourInTucuman(event.occurrences[0].startsAt), event.title).toBe(typed);
    }
    expect(muestra.instances.some((instance) => instance.event_pmv._evo_tz?.[0] === "UTC")).toBe(true);
  });

  it("drops the 23:59 placeholder when the end time was hidden and keeps real ones", () => {
    expect(legacy(4446).occurrences[0].endsAt).toBeNull();
    const withEnd = legacy(8342).occurrences[0];
    expect(Date.parse(withEnd.endsAt!)).toBeGreaterThan(Date.parse(withEnd.startsAt));
  });

  it("keeps repeated dates in order and without duplicates", () => {
    const dates = legacy(9370).occurrences.map((occurrence) => occurrence.startsAt);
    expect(dates.length).toBeGreaterThan(1);
    expect([...dates].sort()).toEqual(dates);
    expect(new Set(dates).size).toBe(dates.length);
  });

  it("links known places by name or alias and leaves the rest as typed places", () => {
    expect(legacy(4446).placeSlug).toBe("casa-museo-de-la-ciudad");
    expect(legacy(4942).placeSlug).toBe("museo-de-la-industria-azucarera-mia");
    // Casa de la Ciudad es otro edificio: no se confunde con la Casa Museo de la Ciudad.
    expect(legacy(9370)).toMatchObject({ placeSlug: null, customPlaceName: "Casa de la Ciudad", customAddress: "Catamarca 920" });
    expect(legacy(8883)).toMatchObject({ placeSlug: null, customPlaceName: "Lugar a confirmar" });
  });

  it("cleans titles, descriptions and summaries", () => {
    for (const event of plan.events) {
      expect(event.title).not.toMatch(/&#?\w+;/);
      expect(event.description ?? "").not.toMatch(/<!--|<\/?p>|&nbsp;/);
      expect(event.summary?.length ?? 0).toBeLessThanOrEqual(221);
    }
    expect(legacy(4446).description).toMatch(/^El viernes 28 de noviembre/);
    expect(legacy(4446).accessType).toBe("free");
  });

  it("merges categories that share a slug across the three taxonomies", () => {
    const slugs = plan.categories.map((category) => category.slug);
    expect(slugs.filter((slug) => slug === "musica")).toHaveLength(1);
    expect(plan.categories.find((category) => category.slug === "ferias-emprendedores")?.name).toBe("Ferias emprendedores");
    expect(categoryName("corte y confección")).toBe("Corte y confección");
  });

  it("does not carry over the old site's featured flag", () => {
    expect(plan.events.every((event) => !event.featured)).toBe(true);
  });

  it("turns Gutenberg markup into paragraphs", () => {
    expect(htmlToParagraphs("<!-- wp:paragraph --><p>Uno&nbsp;y <strong>dos</strong></p><!-- /wp:paragraph --><p>&nbsp;</p><ul><li>A</li><li>B</li></ul>"))
      .toEqual(["Uno y dos", "• A", "• B"]);
  });

  it("summarizes the plan", () => {
    const summary = summarize(plan, new Date("2025-01-01T00:00:00Z"));
    expect(summary).toMatchObject({ events: plan.events.length, withPendingDates: plan.events.length });
    expect(summary.linkedPlaces["casa-museo-de-la-ciudad"]).toBe(1);
    expect(summary.customPlaces["Casa de la Ciudad"]).toBe(1);
  });
});

describe("writing the plan", () => {
  const pg = new PGlite();
  const db: ImportDb = {
    query: async <T>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows,
    transaction: (work) => pg.transaction((tx) => work(async <R>(text: string, params: unknown[] = []) => (await tx.query<R>(text, params)).rows)),
  };
  const count = async (table: string) => (await db.query<{ n: number }>(`select count(*)::int as n from public.${table}`))[0].n;

  beforeAll(async () => {
    const migrations = join(process.cwd(), "db", "migrations");
    for (const file of (await readdir(migrations)).sort()) await pg.exec(await readFile(join(migrations, file), "utf8"));
    for (const place of places) await db.query("insert into public.places (name, slug, status) values ($1, $2, 'published')", [place.name, place.slug]);
    // Un evento cargado a mano desde el panel con el mismo slug que uno importado.
    await db.query(`insert into public.events (title, slug, custom_place_name, status) values ('Del panel', 'encuentro-coral', 'Plaza', 'draft')`);
  });

  it("creates events, categories and dates, and links places", async () => {
    const saved: string[] = [];
    const result = await writePlan(db, plan, { saveImage: async (url) => { saved.push(url); return `/media/eventos/wordpress/${url.split("/").pop()}`; } });
    expect(result).toMatchObject({ created: plan.events.length, skipped: 0, categoriesCreated: plan.categories.length });
    expect(result.renamed).toEqual(["encuentro-coral → encuentro-coral-4446"]);
    expect(await count("event_occurrences")).toBe(plan.events.reduce((total, event) => total + event.occurrences.length, 0));

    const [coral] = await db.query<{ place: string; image: string; status: string }>(`
      select p.slug as place, e.main_image_path as image, e.status from public.events e
      join public.places p on p.id = e.place_id where e.legacy_id = '4446'`);
    expect(coral).toMatchObject({ place: "casa-museo-de-la-ciudad", status: "published", image: expect.stringMatching(/^\/media\/eventos\/wordpress\//) });
    expect(saved.length).toBe(plan.events.filter((event) => event.image).length);
  });

  it("does nothing the second time, unless asked to update", async () => {
    const before = await count("event_occurrences");
    expect(await writePlan(db, plan)).toMatchObject({ created: 0, updated: 0, skipped: plan.events.length });

    const changed: ImportPlan = { ...plan, events: plan.events.map((event) => event.legacyId === "9370" ? { ...event, title: "Título nuevo", occurrences: event.occurrences.slice(0, 1) } : event) };
    const result = await writePlan(db, changed, { update: true });
    expect(result).toMatchObject({ updated: plan.events.length, created: 0 });
    const [row] = await db.query<{ title: string; dates: number }>(`
      select title, (select count(*)::int from public.event_occurrences o where o.event_id = e.id) as dates
      from public.events e where legacy_id = '9370'`);
    expect(row).toEqual({ title: "Título nuevo", dates: 1 });
    expect(await count("event_occurrences")).toBe(before - legacy(9370).occurrences.length + 1);
  });

  it("still loads an event when its photo cannot be downloaded", async () => {
    const one: ImportPlan = { ...plan, events: [{ ...legacy(8342), legacyId: "999999", slug: "sin-foto-de-prueba" }] };
    const result = await writePlan(db, one, { saveImage: async () => { throw new Error("la imagen respondió 404"); } });
    expect(result.created).toBe(1);
    expect(result.imageErrors).toEqual(["sin-foto-de-prueba: la imagen respondió 404"]);
  });
});
