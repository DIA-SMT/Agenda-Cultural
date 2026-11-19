import { cache } from "react";
import { demoEvents } from "@/data/demo";
import { endOfDay, isIsoDate, startOfDay } from "@/lib/dates";
import { isDatabaseConfigured, query } from "@/lib/db";
import { selectEventRowBySlug, selectUpcomingEventRows } from "@/services/event-queries";
import { mapEventRow } from "@/services/event-rows";
import type { Category, CulturalEvent, EventFilters, PaginatedEvents, Place } from "@/types/domain";

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-AR");
}

// Eventos publicados con al menos una fecha que todavía no terminó. Las fechas pasadas quedan fuera.
// Sin DATABASE_URL se usan los datos de demostración, que no se filtran por fecha.
const getUpcomingEvents = cache(async (): Promise<CulturalEvent[]> => {
  if (!isDatabaseConfigured) return demoEvents.filter((event) => event.status === "published");
  return (await selectUpcomingEventRows(query, new Date())).map(mapEventRow);
});

export function filterEvents(events: CulturalEvent[], filters: EventFilters = {}): PaginatedEvents {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 9));
  const query = filters.query?.trim() ? normalize(filters.query.trim()) : undefined;
  const from = isIsoDate(filters.from) ? startOfDay(filters.from).getTime() : -Infinity;
  const to = isIsoDate(filters.to) ? endOfDay(filters.to).getTime() : Infinity;

  const filtered = events
    .filter((event) => !query || [event.title, event.summary, event.place.name].some((value) => normalize(value).includes(query)))
    .filter((event) => !filters.category || event.categories.some((category) => category.slug === filters.category))
    .filter((event) => !filters.place || event.place.slug === filters.place)
    .filter((event) => !filters.free || event.accessType === "free")
    .flatMap((event) => {
      const index = event.occurrences.findIndex((occurrence) =>
        Date.parse(occurrence.startsAt) <= to && Date.parse(occurrence.endsAt ?? occurrence.startsAt) >= from);
      // La tarjeta muestra la primera fecha que cae dentro del rango pedido.
      return index === -1 ? [] : [{ ...event, occurrences: event.occurrences.slice(index) }];
    })
    .sort((a, b) => Date.parse(a.occurrences[0].startsAt) - Date.parse(b.occurrences[0].startsAt));

  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
}

export async function getEvents(filters: EventFilters = {}): Promise<PaginatedEvents> {
  return filterEvents(await getUpcomingEvents(), filters);
}

export const getEventBySlug = cache(async (slug: string): Promise<CulturalEvent | null> => {
  if (!isDatabaseConfigured) {
    return demoEvents.find((event) => event.slug === slug && event.status === "published") ?? null;
  }

  const row = await selectEventRowBySlug(query, slug);
  if (!row) return null;

  const event = mapEventRow(row);
  // Se muestran sólo las fechas pendientes; si el evento ya pasó, se conservan todas.
  const now = Date.now();
  const upcoming = event.occurrences.filter((occurrence) => Date.parse(occurrence.endsAt ?? occurrence.startsAt) >= now);
  return { ...event, occurrences: upcoming.length ? upcoming : event.occurrences };
});

export async function getAgendaOptions(): Promise<{ categories: Category[]; places: Place[] }> {
  const categories = new Map<string, Category>();
  const places = new Map<string, Place>();
  for (const event of await getUpcomingEvents()) {
    event.categories.forEach((category) => categories.set(category.slug, category));
    if (event.place.slug) places.set(event.place.slug, event.place);
  }
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "es-AR");
  return { categories: [...categories.values()].sort(byName), places: [...places.values()].sort(byName) };
}

/** Las categorías con más actividades por venir: los accesos de la portada se arman con esto. */
export async function getPopularCategories(limit = 4): Promise<(Category & { count: number })[]> {
  const counts = new Map<string, { category: Category; count: number }>();
  for (const event of await getUpcomingEvents()) {
    for (const category of event.categories) {
      const entry = counts.get(category.slug) ?? { category, count: 0 };
      entry.count++;
      counts.set(category.slug, entry);
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.category.name.localeCompare(b.category.name, "es-AR"))
    .slice(0, limit)
    .map(({ category, count }) => ({ ...category, count }));
}

/** Todos los eventos publicados que todavía tienen fechas por venir, sin paginar (para Migue). */
export async function getAllUpcomingEvents(): Promise<CulturalEvent[]> {
  return getUpcomingEvents();
}

export async function getEventSlugs() {
  return (await getUpcomingEvents()).map((event) => event.slug);
}
