import { describe, expect, it } from "vitest";
import { DEFAULT_EVENT_IMAGE, mapEventRow, type EventRow } from "./event-rows";

const place: NonNullable<EventRow["place"]> = {
  id: "place-1", name: "Teatro San Martín", slug: "teatro-san-martin", type: "theater", summary: null,
  address: "Av. Sarmiento 601", latitude: "-26.824100", longitude: "-65.222600", main_image_path: "/media/teatro.jpg",
  featured: false, status: "published",
};

function row(overrides: Partial<EventRow> = {}): EventRow {
  return {
    id: "event-1", title: "Concierto", slug: "concierto", summary: "Resumen", description: null,
    main_image_path: null, organizer: null, price: null, access_type: "free", registration_url: null,
    ticket_url: null, accessibility: null, featured: false, status: "published", legacy_url: null,
    custom_place_name: null, custom_address: null, custom_latitude: null, custom_longitude: null,
    place, categories: [{ id: "cat-1", name: "Música", slug: "musica", color: null, icon: null }],
    event_occurrences: [
      { id: "occ-2", event_id: "event-1", starts_at: "2026-12-05T23:00:00+00:00", ends_at: null, all_day: false, status: "scheduled" },
      { id: "occ-1", event_id: "event-1", starts_at: "2026-11-28T23:00:00+00:00", ends_at: null, all_day: false, status: "scheduled" },
      { id: "occ-3", event_id: "event-1", starts_at: "2026-11-20T23:00:00+00:00", ends_at: null, all_day: false, status: "cancelled" },
    ],
    ...overrides,
  };
}

describe("mapEventRow", () => {
  it("sorts occurrences and drops cancelled ones", () => {
    expect(mapEventRow(row()).occurrences.map((occurrence) => occurrence.id)).toEqual(["occ-1", "occ-2"]);
    expect(mapEventRow(row({ event_occurrences: null })).occurrences).toEqual([]);
  });

  it("falls back from summary and fills category defaults", () => {
    const event = mapEventRow(row());
    expect(event.description).toBe("Resumen");
    expect(event.categories[0]).toMatchObject({ slug: "musica", color: "#0274BE" });
    expect(event.place).toMatchObject({ slug: "teatro-san-martin", latitude: -26.8241 });
  });

  it("uses the custom place when there is no linked place", () => {
    const event = mapEventRow(row({ place: null, custom_place_name: "Plaza Independencia", custom_address: "24 de Septiembre 500" }));
    expect(event.place).toMatchObject({ name: "Plaza Independencia", address: "24 de Septiembre 500", slug: "" });
  });

  it("resolves images: event, then place, then default", () => {
    expect(mapEventRow(row({ main_image_path: "/media/afiche.jpg" })).imageUrl).toBe("/media/afiche.jpg");
    expect(mapEventRow(row({ main_image_path: "https://agendaculturalsmt.com/wp-content/uploads/a.jpg" })).imageUrl).toBe("https://agendaculturalsmt.com/wp-content/uploads/a.jpg");
    expect(mapEventRow(row()).imageUrl).toBe("/media/teatro.jpg");
    expect(mapEventRow(row({ place: null, custom_place_name: "Plaza" })).imageUrl).toBe(DEFAULT_EVENT_IMAGE);
  });

  it("ignores image paths next/image cannot load", () => {
    expect(mapEventRow(row({ main_image_path: "afiches/sin-barra.jpg", place: null, custom_place_name: "Plaza" })).imageUrl).toBe(DEFAULT_EVENT_IMAGE);
  });
});
