import { describe, expect, it } from "vitest";
import { demoCategories, demoEvents } from "@/data/demo";
import type { Category, CulturalEvent, EventOccurrence } from "@/types/domain";
import {
  countByDay, eventsOnDay, filterEvents, getAgendaOptions, getCalendarDays, getEvents, getPopularCategories, lastActivityDay,
} from "./events";

const at = (id: string, startsAt: string, endsAt?: string, allDay = false): EventOccurrence =>
  ({ ...demoEvents[0].occurrences[0], id, startsAt, endsAt, allDay });
const eventWith = (slug: string, occurrences: EventOccurrence[], categories: Category[] = [demoCategories[0]]): CulturalEvent =>
  ({ ...demoEvents[0], id: slug, slug, title: slug, occurrences, categories });

// Un taller con dos funciones el mismo día, una muestra de casi un mes, una función que termina a
// medianoche, una trasnoche (01:30 ya es el día siguiente) y una matiné.
const taller = eventWith("taller", [
  at("t1", "2026-11-20T18:00:00-03:00", "2026-11-20T20:00:00-03:00"),
  at("t2", "2026-11-20T21:00:00-03:00"),
  at("t3", "2026-11-27T18:00:00-03:00"),
]);
const muestra = eventWith("muestra", [at("m1", "2026-11-10T09:00:00-03:00", "2026-12-05T20:00:00-03:00")]);
const funcion = eventWith("funcion", [at("f1", "2026-11-21T22:00:00-03:00", "2026-11-22T00:00:00-03:00")]);
const trasnoche = eventWith("trasnoche", [at("n1", "2026-11-22T01:30:00-03:00")]);
const matine = eventWith("matine", [at("a1", "2026-11-20T10:00:00-03:00")]);

describe("countByDay", () => {
  const events = [taller, muestra, funcion, trasnoche];

  it("counts each event once a day and spreads long dates over all their days", () => {
    const { days, total } = countByDay(events, {}, "2026-11-20", "2026-11-30");
    expect(days["2026-11-20"].count).toBe(2);
    expect(days["2026-11-21"].count).toBe(2);
    // La función de las 22 termina a medianoche: el 22 sólo están la muestra y la trasnoche.
    expect(days["2026-11-22"].count).toBe(2);
    expect(days["2026-11-30"].count).toBe(1);
    expect(total).toBe(4);
  });

  it("leaves out the days outside the range, like the past days of a running exhibition", () => {
    const { days } = countByDay([muestra], {}, "2026-11-20", "2026-11-30");
    expect(days["2026-11-19"]).toBeUndefined();
    expect(Object.keys(days)).toHaveLength(11);
  });

  it("applies the agenda filters", () => {
    expect(countByDay(events, { query: "TALLER" }, "2026-11-01", "2026-11-30").total).toBe(1);
    expect(countByDay(events, { category: "teatro" }, "2026-11-01", "2026-11-30").total).toBe(0);
  });

  it("illustrates the day with its most frequent categories", () => {
    const [musica, teatro, talleres, familia] = demoCategories;
    const { days } = countByDay([
      eventWith("a", [matine.occurrences[0]], [musica, teatro]),
      eventWith("b", [matine.occurrences[0]], [musica]),
      eventWith("c", [matine.occurrences[0]], [talleres, familia]),
    ], {}, "2026-11-20", "2026-11-20");
    expect(days["2026-11-20"].categories.map((category) => category.slug)).toEqual(["musica", "teatro", "talleres"]);
  });
});

describe("lastActivityDay", () => {
  it("finds the last day with something on", () => {
    expect(lastActivityDay([taller, muestra], {})).toBe("2026-12-05");
    expect(lastActivityDay([taller, muestra], { query: "taller" })).toBe("2026-11-27");
    expect(lastActivityDay([], {})).toBeUndefined();
  });
});

describe("eventsOnDay", () => {
  it("lists timed activities in order, then the all-day ones", () => {
    const entries = eventsOnDay([muestra, taller, matine], {}, "2026-11-20");
    expect(entries.map((entry) => [entry.event.slug, entry.occurrence.id, entry.allDay, entry.until])).toEqual([
      ["matine", "a1", false, undefined],
      ["taller", "t1", false, undefined],
      ["muestra", "m1", true, "2026-12-05"],
    ]);
  });

  it("agrees with the calendar at midnight", () => {
    expect(eventsOnDay([funcion, trasnoche], {}, "2026-11-22").map((entry) => entry.event.slug)).toEqual(["trasnoche"]);
    expect(eventsOnDay([funcion, trasnoche], {}, "2026-11-21").map((entry) => entry.event.slug)).toEqual(["funcion"]);
  });

  it("keeps dates marked as all day on their own day", () => {
    const [entry] = eventsOnDay([eventWith("feria", [at("x1", "2026-11-28T00:00:00-03:00", undefined, true)])], {}, "2026-11-28");
    expect(entry).toMatchObject({ allDay: true, until: undefined });
  });
});

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

  it("counts the demo events per day for the calendar", async () => {
    const calendar = await getCalendarDays({}, "2026-09-18", "2026-09-30");
    expect(Object.fromEntries(Object.entries(calendar.days).map(([day, summary]) => [day, summary.count]))).toEqual({
      "2026-09-18": 1, "2026-09-19": 1, "2026-09-20": 1, "2026-09-27": 1,
    });
    expect(calendar).toMatchObject({ total: 3, lastDay: "2026-09-27" });
  });

  it("ranks categories by upcoming events, then by name", async () => {
    const popular = await getPopularCategories(3);
    expect(popular.map((category) => [category.slug, category.count])).toEqual([["musica", 1], ["familia", 1], ["talleres", 1]]);
  });
});
