import { cache } from "react";
import { demoEvents } from "@/data/demo";
import { addDays, endOfDay, isIsoDate, startOfDay, tucumanDate } from "@/lib/dates";
import { isDatabaseConfigured, query } from "@/lib/db";
import { selectEventRowBySlug, selectUpcomingEventRows } from "@/services/event-queries";
import { mapEventRow } from "@/services/event-rows";
import type { Category, CulturalEvent, EventFilters, EventOccurrence, PaginatedEvents, Place } from "@/types/domain";

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-AR");
}

// Eventos publicados con al menos una fecha que todavía no terminó. Las fechas pasadas quedan fuera.
// Sin DATABASE_URL se usan los datos de demostración, que no se filtran por fecha.
const getUpcomingEvents = cache(async (): Promise<CulturalEvent[]> => {
  if (!isDatabaseConfigured) return demoEvents.filter((event) => event.status === "published");
  return (await selectUpcomingEventRows(query, new Date())).map(mapEventRow);
});

/** Búsqueda, categoría, lugar y gratuidad: todos los filtros menos las fechas. */
function matchingEvents(events: CulturalEvent[], filters: EventFilters) {
  const query = filters.query?.trim() ? normalize(filters.query.trim()) : undefined;
  return events
    .filter((event) => !query || [event.title, event.summary, event.place.name].some((value) => normalize(value).includes(query)))
    .filter((event) => !filters.category || event.categories.some((category) => category.slug === filters.category))
    .filter((event) => !filters.place || event.place.slug === filters.place)
    .filter((event) => !filters.free || event.accessType === "free");
}

export function filterEvents(events: CulturalEvent[], filters: EventFilters = {}): PaginatedEvents {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 9));
  const from = isIsoDate(filters.from) ? startOfDay(filters.from).getTime() : -Infinity;
  const to = isIsoDate(filters.to) ? endOfDay(filters.to).getTime() : Infinity;

  const filtered = matchingEvents(events, filters)
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

/** Primer y último día (en Tucumán) que ocupa una fecha. Una función que termina a medianoche no ocupa el día siguiente. */
function occurrenceDays(occurrence: EventOccurrence) {
  const start = Date.parse(occurrence.startsAt);
  const end = occurrence.endsAt ? Date.parse(occurrence.endsAt) : start;
  return { first: tucumanDate(start), last: tucumanDate(end > start ? end - 1 : start) };
}

export interface DaySummary {
  count: number;
  /** Las categorías más repetidas del día, para ilustrar el casillero. */
  categories: Category[];
}

/**
 * Cuántas actividades hay cada día entre from y to (inclusive). Una muestra que dura semanas cuenta en
 * cada uno de sus días; un evento con dos funciones el mismo día cuenta una vez. total son las
 * actividades distintas de todo el período.
 */
export function countByDay(events: CulturalEvent[], filters: EventFilters, from: string, to: string) {
  const perDay = new Map<string, Set<CulturalEvent>>();
  const all = new Set<CulturalEvent>();
  for (const event of matchingEvents(events, filters)) {
    for (const occurrence of event.occurrences) {
      const { first, last } = occurrenceDays(occurrence);
      for (let day = first < from ? from : first; day <= last && day <= to; day = addDays(day, 1)) {
        perDay.set(day, (perDay.get(day) ?? new Set()).add(event));
        all.add(event);
      }
    }
  }

  const days: Record<string, DaySummary> = {};
  for (const [day, dayEvents] of perDay) {
    const categories = new Map<string, { category: Category; count: number }>();
    for (const event of dayEvents) {
      for (const category of event.categories) {
        const entry = categories.get(category.slug) ?? { category, count: 0 };
        entry.count++;
        categories.set(category.slug, entry);
      }
    }
    days[day] = {
      count: dayEvents.size,
      categories: [...categories.values()].sort((a, b) => b.count - a.count).slice(0, 3).map((entry) => entry.category),
    };
  }
  return { days, total: all.size };
}

/** El último día con alguna actividad que cumpla los filtros: hasta ahí deja avanzar el calendario. */
export function lastActivityDay(events: CulturalEvent[], filters: EventFilters) {
  let last: string | undefined;
  for (const event of matchingEvents(events, filters)) {
    for (const occurrence of event.occurrences) {
      const day = occurrenceDays(occurrence).last;
      if (!last || day > last) last = day;
    }
  }
  return last;
}

export interface DayEntry {
  event: CulturalEvent;
  occurrence: EventOccurrence;
  /** Todo el día, o una muestra que empezó antes: ese día no tiene un horario propio. */
  allDay: boolean;
  /** Último día de una fecha que sigue después de este (una muestra, un festival de varios días). */
  until?: string;
}

/** Las actividades de un día: primero las que tienen horario, en orden; después las de todo el día. */
export function eventsOnDay(events: CulturalEvent[], filters: EventFilters, day: string): DayEntry[] {
  const entries = matchingEvents(events, filters).flatMap((event) => {
    const occurrence = event.occurrences.find((candidate) => {
      const { first, last } = occurrenceDays(candidate);
      return first <= day && day <= last;
    });
    if (!occurrence) return [];
    const { first, last } = occurrenceDays(occurrence);
    return [{ event, occurrence, allDay: occurrence.allDay || first < day, until: last > day ? last : undefined }];
  });
  return entries.sort((a, b) => Number(a.allDay) - Number(b.allDay)
    || (a.allDay
      ? a.event.title.localeCompare(b.event.title, "es-AR")
      : Date.parse(a.occurrence.startsAt) - Date.parse(b.occurrence.startsAt)));
}

export async function getCalendarDays(filters: EventFilters, from: string, to: string) {
  const events = await getUpcomingEvents();
  return { ...countByDay(events, filters, from, to), lastDay: lastActivityDay(events, filters) };
}

export async function getDayEvents(filters: EventFilters, day: string) {
  return eventsOnDay(await getUpcomingEvents(), filters, day);
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
