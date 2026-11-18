// @vitest-environment node
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import type { Db, Query } from "@/lib/db";
import { isUniqueViolation } from "@/lib/forms";
import { findAccountByEmail, findAccountById, recordAttempt, sessionStillValid, tooManyAttempts } from "./accounts";
import { deleteCategory, getCategory, listCategories, saveCategory } from "./categories";
import { adminCounts, deleteEvent, getEventAdmin, listEventsAdmin, saveEvent, type EventInput } from "./events";
import { getPlaceAdmin, listPlacesAdmin, savePlace } from "./places";

const pg = new PGlite();
const query: Query = async <T>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows;
const db: Db = {
  query,
  transaction: (work) => pg.transaction((tx) => work(async <T>(text: string, params: unknown[] = []) => (await tx.query<T>(text, params)).rows)),
};

beforeAll(async () => {
  const migrations = join(process.cwd(), "db", "migrations");
  for (const file of (await readdir(migrations)).sort()) await pg.exec(await readFile(join(migrations, file), "utf8"));
});

describe("accounts", () => {
  it("finds accounts case-insensitively and checks sessions against the cut-off", async () => {
    await query(`insert into public.profiles (email, full_name, role, status, password_hash, sessions_valid_since)
      values ('ana@smt.gob.ar', 'Ana Pérez', 'admin', 'active', 'scrypt$x', '2026-11-18T12:00:00Z')`);
    const account = await findAccountByEmail(query, " Ana@SMT.gob.ar ");
    expect(account).toMatchObject({ full_name: "Ana Pérez", role: "admin" });
    expect(await findAccountById(query, account!.id)).toMatchObject({ email: "ana@smt.gob.ar" });
    expect(await findAccountById(query, "no-es-un-uuid")).toBeNull();

    const cut = Date.parse("2026-11-18T12:00:00Z") / 1000;
    expect(sessionStillValid(account, cut)).toBe(true);
    expect(sessionStillValid(account, cut - 1)).toBe(false);
    expect(sessionStillValid({ ...account!, status: "inactive" }, cut)).toBe(false);
    expect(sessionStillValid({ ...account!, password_hash: null }, cut)).toBe(false);
  });

  it("blocks after five failures for the same email", async () => {
    for (let i = 0; i < 4; i++) await recordAttempt(query, "beto@smt.gob.ar", "10.0.0.1", false);
    expect(await tooManyAttempts(query, "beto@smt.gob.ar", "10.0.0.2")).toBe(false);
    await recordAttempt(query, "beto@smt.gob.ar", "10.0.0.1", false);
    expect(await tooManyAttempts(query, "beto@smt.gob.ar", "10.0.0.2")).toBe(true);
    expect(await tooManyAttempts(query, "otra@smt.gob.ar", null)).toBe(false);
  });
});

describe("categories", () => {
  it("creates, edits, refuses duplicate slugs and deletes", async () => {
    const id = await saveCategory(query, { name: "Música", slug: "musica", color: "#0274be", description: null, status: "published" });
    await saveCategory(query, { name: "Música en vivo", slug: "musica", color: "#0274be", description: "Recitales", status: "published" }, id!);
    expect(await getCategory(query, id!)).toMatchObject({ name: "Música en vivo", description: "Recitales", events: 0 });

    const duplicate = saveCategory(query, { name: "Otra", slug: "musica", color: null, description: null, status: "draft" });
    await expect(duplicate).rejects.toSatisfy(isUniqueViolation);

    const other = await saveCategory(query, { name: "Danza", slug: "danza", color: null, description: null, status: "draft" });
    await deleteCategory(query, other!);
    expect((await listCategories(query)).map((category) => category.slug)).toEqual(["musica"]);
  });
});

describe("places", () => {
  it("saves lines, links and photos and reads them back", async () => {
    const id = await savePlace(query, {
      name: "Casa de prueba", slug: "casa-de-prueba", type: "museum", status: "published", featured: true,
      summary: "Resumen", description: "Uno.\n\nDos.", address: "Calle 1", phone: null, email: null, website: null,
      openingHours: ["Lunes a viernes, 9 a 13 h"], services: ["Capacidad: 300, con palcos"],
      socialLinks: { instagram: "https://www.instagram.com/casa/" },
      mainImagePath: "/media/lugares/2026/a.jpg", galleryPaths: ["/media/lugares/2026/b.jpg", "/media/lugares/2026/c.jpg"],
    });
    expect(await getPlaceAdmin(query, id!)).toMatchObject({
      opening_hours: { lineas: ["Lunes a viernes, 9 a 13 h"] },
      services: ["Capacidad: 300, con palcos"],
      social_links: { instagram: "https://www.instagram.com/casa/" },
      gallery_paths: ["/media/lugares/2026/b.jpg", "/media/lugares/2026/c.jpg"],
    });
    expect((await listPlacesAdmin(query)).find((place) => place.id === id)).toMatchObject({ events: 0, status: "published" });
  });
});

describe("events", () => {
  let placeId = "";
  let categoryId = "";
  const base = (): EventInput => ({
    title: "Concierto de prueba", slug: "concierto-de-prueba", status: "draft", featured: false, summary: "Resumen",
    description: null, mainImagePath: null, placeId, customPlaceName: null, customAddress: null, organizer: null,
    price: null, accessType: "free", registrationUrl: null, ticketUrl: null, accessibility: null,
    categoryIds: [categoryId],
    occurrences: [
      { id: null, startsAt: "2030-03-01T20:00:00-03:00", endsAt: "2030-03-01T22:00:00-03:00", status: "scheduled" },
      { id: null, startsAt: "2030-03-08T20:00:00-03:00", endsAt: null, status: "scheduled" },
    ],
  });

  beforeAll(async () => {
    placeId = (await listPlacesAdmin(query))[0].id;
    categoryId = (await listCategories(query))[0].id;
  });

  it("saves the event with its categories and dates in one go", async () => {
    const id = await saveEvent(db, base());
    const event = await getEventAdmin(query, id!);
    expect(event).toMatchObject({ title: "Concierto de prueba", place_id: placeId, category_ids: [categoryId] });
    expect(event!.occurrences).toHaveLength(2);
    expect(Date.parse(String(event!.occurrences[0].starts_at))).toBe(Date.parse("2030-03-01T23:00:00Z"));
  });

  it("updates dates in place, drops removed ones and stamps the publication", async () => {
    const [{ id }] = await query<{ id: string }>("select id from public.events where slug = 'concierto-de-prueba'");
    const before = await getEventAdmin(query, id);
    const [first] = before!.occurrences;
    await saveEvent(db, {
      ...base(), status: "published", categoryIds: [],
      occurrences: [{ id: first.id, startsAt: "2030-03-01T21:00:00-03:00", endsAt: null, status: "cancelled" }],
    }, id);

    const after = await getEventAdmin(query, id);
    expect(after!.category_ids).toEqual([]);
    expect(after!.occurrences).toEqual([expect.objectContaining({ id: first.id, status: "cancelled", ends_at: null })]);
    const [{ published_at }] = await query<{ published_at: Date | null }>("select published_at from public.events where id = $1", [id]);
    expect(published_at).not.toBeNull();
  });

  it("rolls everything back when a part fails", async () => {
    const broken = { ...base(), slug: "evento-roto", categoryIds: ["00000000-0000-0000-0000-000000000000"] };
    await expect(saveEvent(db, broken)).rejects.toThrow();
    expect(await query("select 1 from public.events where slug = 'evento-roto'")).toEqual([]);
  });

  it("lists upcoming events first and counts what is published", async () => {
    await saveEvent(db, { ...base(), title: "Muestra", slug: "muestra", status: "published",
      occurrences: [{ id: null, startsAt: "2030-01-10T10:00:00-03:00", endsAt: null, status: "scheduled" }] });
    const list = await listEventsAdmin(query);
    expect(list.map((event) => event.slug)).toEqual(["muestra", "concierto-de-prueba"]);
    expect(await listEventsAdmin(query, { search: "MUES" })).toHaveLength(1);
    expect(await listEventsAdmin(query, { status: "draft" })).toHaveLength(0);
    expect(await adminCounts(query)).toMatchObject({ published: 2, drafts: 0, upcoming: 1 });
  });

  it("deletes the event with its dates", async () => {
    const [{ id }] = await query<{ id: string }>("select id from public.events where slug = 'muestra'");
    await deleteEvent(query, id);
    expect(await query("select 1 from public.event_occurrences where event_id = $1", [id])).toEqual([]);
  });
});
