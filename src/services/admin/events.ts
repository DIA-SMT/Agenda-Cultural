import type { Db, Query } from "@/lib/db";
import type { AccessType, EventOccurrence, EventStatus } from "@/types/domain";

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  featured: boolean;
  place: string | null;
  next_start: Date | string | null;
  last_start: Date | string | null;
  occurrences: number;
}

export interface OccurrenceAdmin {
  id: string;
  starts_at: Date | string;
  ends_at: Date | string | null;
  status: EventOccurrence["status"];
}

export interface EventAdmin {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  featured: boolean;
  summary: string | null;
  description: string | null;
  main_image_path: string | null;
  place_id: string | null;
  custom_place_name: string | null;
  custom_address: string | null;
  organizer: string | null;
  price: string | null;
  access_type: AccessType;
  registration_url: string | null;
  ticket_url: string | null;
  accessibility: string | null;
  category_ids: string[];
  occurrences: OccurrenceAdmin[];
}

export interface OccurrenceInput {
  /** Vacío para una fecha nueva. */
  id: string | null;
  startsAt: string;
  endsAt: string | null;
  status: EventOccurrence["status"];
}

export interface EventInput {
  title: string;
  slug: string;
  status: EventStatus;
  featured: boolean;
  summary: string | null;
  description: string | null;
  mainImagePath: string | null;
  placeId: string | null;
  customPlaceName: string | null;
  customAddress: string | null;
  organizer: string | null;
  price: string | null;
  accessType: AccessType;
  registrationUrl: string | null;
  ticketUrl: string | null;
  accessibility: string | null;
  categoryIds: string[];
  occurrences: OccurrenceInput[];
}

export async function listEventsAdmin(query: Query, filters: { search?: string; status?: string } = {}) {
  return query<EventListItem>(`
    select e.id, e.title, e.slug, e.status, e.featured, coalesce(p.name, e.custom_place_name) as place,
      (select min(o.starts_at) from public.event_occurrences o where o.event_id = e.id and coalesce(o.ends_at, o.starts_at) >= now()) as next_start,
      (select max(o.starts_at) from public.event_occurrences o where o.event_id = e.id) as last_start,
      (select count(*) from public.event_occurrences o where o.event_id = e.id)::int as occurrences
    from public.events e
    left join public.places p on p.id = e.place_id
    where ($1::text is null or e.title ilike '%' || $1 || '%')
      and ($2::text is null or e.status::text = $2)
    order by (select min(o.starts_at) from public.event_occurrences o where o.event_id = e.id and coalesce(o.ends_at, o.starts_at) >= now()) asc nulls last,
      e.updated_at desc
    limit 200`, [filters.search || null, filters.status || null]);
}

export async function getEventAdmin(query: Query, id: string) {
  const [row] = await query<EventAdmin>(`
    select e.id, e.title, e.slug, e.status, e.featured, e.summary, e.description, e.main_image_path, e.place_id,
      e.custom_place_name, e.custom_address, e.organizer, e.price, e.access_type, e.registration_url, e.ticket_url,
      e.accessibility,
      array(select ec.category_id::text from public.event_categories ec where ec.event_id = e.id) as category_ids,
      coalesce((select json_agg(json_build_object('id', o.id, 'starts_at', o.starts_at, 'ends_at', o.ends_at, 'status', o.status) order by o.starts_at)
        from public.event_occurrences o where o.event_id = e.id), '[]'::json) as occurrences
    from public.events e where e.id = $1`, [id]);
  return row ?? null;
}

/** Guarda el evento con sus categorías y fechas en una sola transacción. Devuelve el id. */
export async function saveEvent(db: Db, input: EventInput, id?: string) {
  return db.transaction(async (query) => {
    const values = [
      input.title, input.slug, input.status, input.featured, input.summary, input.description, input.mainImagePath,
      input.placeId, input.customPlaceName, input.customAddress, input.organizer, input.price, input.accessType,
      input.registrationUrl, input.ticketUrl, input.accessibility,
    ];
    const [row] = id
      ? await query<{ id: string }>(`
          update public.events set title = $1, slug = $2, status = $3::public.event_status, featured = $4, summary = $5,
            description = $6, main_image_path = $7, place_id = $8, custom_place_name = $9, custom_address = $10,
            organizer = $11, price = $12, access_type = $13::public.access_type, registration_url = $14,
            ticket_url = $15, accessibility = $16,
            published_at = case when $3 = 'published' then coalesce(published_at, now()) else published_at end
          where id = $17 returning id`, [...values, id])
      : await query<{ id: string }>(`
          insert into public.events (title, slug, status, featured, summary, description, main_image_path, place_id,
            custom_place_name, custom_address, organizer, price, access_type, registration_url, ticket_url,
            accessibility, published_at)
          values ($1, $2, $3::public.event_status, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::public.access_type,
            $14, $15, $16, case when $3 = 'published' then now() end)
          returning id`, values);
    if (!row) return null;
    const eventId = row.id;

    await query("delete from public.event_categories where event_id = $1", [eventId]);
    await query(`
      insert into public.event_categories (event_id, category_id)
      select $1, value::uuid from jsonb_array_elements_text($2::text::jsonb)`, [eventId, JSON.stringify(input.categoryIds)]);

    // Las fechas que ya no vienen en el formulario se borran; las que vienen con id se actualizan.
    const kept = input.occurrences.map((occurrence) => occurrence.id).filter(Boolean);
    await query(`
      delete from public.event_occurrences
      where event_id = $1 and id::text not in (select jsonb_array_elements_text($2::text::jsonb))`, [eventId, JSON.stringify(kept)]);
    for (const occurrence of input.occurrences) {
      const occurrenceValues = [occurrence.startsAt, occurrence.endsAt, occurrence.status];
      if (occurrence.id) {
        await query(`
          update public.event_occurrences set starts_at = $1, ends_at = $2, status = $3::public.occurrence_status
          where id = $4 and event_id = $5`, [...occurrenceValues, occurrence.id, eventId]);
      } else {
        await query(`
          insert into public.event_occurrences (event_id, starts_at, ends_at, status)
          values ($1, $2, $3, $4::public.occurrence_status)`, [eventId, ...occurrenceValues]);
      }
    }
    return eventId;
  });
}

export async function deleteEvent(query: Query, id: string) {
  await query("delete from public.events where id = $1", [id]);
}

export async function adminCounts(query: Query) {
  const [row] = await query<{ published: number; drafts: number; upcoming: number; places: number; categories: number }>(`
    select
      (select count(*) from public.events where status = 'published')::int as published,
      (select count(*) from public.events where status = 'draft')::int as drafts,
      (select count(distinct o.event_id) from public.event_occurrences o join public.events e on e.id = o.event_id
        where e.status = 'published' and o.status <> 'cancelled' and coalesce(o.ends_at, o.starts_at) >= now())::int as upcoming,
      (select count(*) from public.places where status = 'published')::int as places,
      (select count(*) from public.categories where status = 'published')::int as categories`);
  return row;
}
