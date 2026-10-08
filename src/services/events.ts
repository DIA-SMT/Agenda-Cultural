import { demoEvents } from "@/data/demo";
import type { CulturalEvent, EventFilters, PaginatedEvents } from "@/types/domain";

export async function getEvents(filters: EventFilters = {}): Promise<PaginatedEvents> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 9));
  const query = filters.query?.trim().toLocaleLowerCase("es-AR");

  const filtered = demoEvents
    .filter((event) => event.status === "published")
    .filter((event) => !query || [event.title, event.summary, event.place.name].some((value) => value.toLocaleLowerCase("es-AR").includes(query)))
    .filter((event) => !filters.category || event.categories.some((category) => category.slug === filters.category))
    .filter((event) => !filters.place || event.place.slug === filters.place)
    .filter((event) => !filters.free || event.accessType === "free")
    .filter((event) => {
      const startsAt = event.occurrences[0]?.startsAt;
      if (!startsAt) return false;
      if (filters.from && startsAt < `${filters.from}T00:00:00`) return false;
      if (filters.to && startsAt > `${filters.to}T23:59:59`) return false;
      return true;
    })
    .sort((a, b) => a.occurrences[0].startsAt.localeCompare(b.occurrences[0].startsAt));

  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
}

export async function getEventBySlug(slug: string): Promise<CulturalEvent | null> {
  return demoEvents.find((event) => event.slug === slug && event.status === "published") ?? null;
}
