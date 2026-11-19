import { describe, expect, it } from "vitest";
import { demoEvents } from "@/data/demo";
import { filterEvents, getAgendaOptions, getEvents, getPopularCategories } from "./events";

describe("filterEvents", () => {
  it("searches ignoring accents and case", () => {
    expect(filterEvents(demoEvents, { query: "MUSICA" }).items.map((event) => event.slug)).toEqual(["encuentro-musical-demo"]);
    expect(filterEvents(demoEvents, { query: "demostración" }).total).toBe(3);
  });

  it("filters by category, place and free access", () => {
    expect(filterEvents(demoEvents, { category: "teatro" }).items.map((event) => event.slug)).toEqual(["funcion-teatro-demo"]);
    expect(filterEvents(demoEvents, { place: "punto-encuentro-demo" }).total).toBe(1);
    expect(filterEvents(demoEvents, { free: true }).items.map((event) => event.slug)).toEqual(["encuentro-musical-demo"]);
  });

  it("matches later occurrences and shows the one in range first", () => {
    const { items } = filterEvents(demoEvents, { from: "2026-09-27", to: "2026-09-27" });
    expect(items.map((event) => event.slug)).toEqual(["taller-creativo-demo"]);
    expect(items[0].occurrences[0].id).toBe("occ-4");
  });

  it("compares instants, not strings, at day boundaries", () => {
    const lateNight = { ...demoEvents[0], occurrences: [{ ...demoEvents[0].occurrences[0], startsAt: "2026-09-19T02:30:00+00:00", endsAt: undefined }] };
    expect(filterEvents([lateNight], { from: "2026-09-18", to: "2026-09-18" }).total).toBe(1);
    expect(filterEvents([lateNight], { from: "2026-09-19", to: "2026-09-19" }).total).toBe(0);
  });

  it("ignores malformed dates", () => expect(filterEvents(demoEvents, { from: "ayer" }).total).toBe(3));

  it("sorts by date and paginates", () => {
    const result = filterEvents(demoEvents, { pageSize: 2, page: 2 });
    expect(result).toMatchObject({ total: 3, page: 2, pageSize: 2 });
    expect(result.items.map((event) => event.slug)).toEqual(["taller-creativo-demo"]);
  });
});

describe("demo mode", () => {
  it("serves the demo events when the database is not configured", async () => {
    expect((await getEvents()).total).toBe(3);
  });

  it("derives filter options from the events", async () => {
    const options = await getAgendaOptions();
    expect(options.categories.map((category) => category.slug)).toEqual(["musica", "familia", "talleres", "teatro"]);
    expect(options.places.map((place) => place.slug)).toEqual(["espacio-cultural-demo", "punto-encuentro-demo"]);
  });

  it("ranks categories by upcoming events, then by name", async () => {
    const popular = await getPopularCategories(3);
    expect(popular.map((category) => [category.slug, category.count])).toEqual([["musica", 1], ["familia", 1], ["talleres", 1]]);
  });
});
