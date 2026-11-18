import type { Query } from "@/lib/db";
import type { EventRow } from "@/services/event-rows";

// Cada fila trae el lugar, las categorías y las fechas ya anidadas como JSON, con la forma de EventRow.
// Sólo se ve contenido publicado: lugares y categorías en borrador quedan afuera aunque el evento los use.
const eventColumns = `
  e.id, e.title, e.slug, e.summary, e.description, e.main_image_path, e.organizer, e.price, e.access_type,
  e.registration_url, e.ticket_url, e.accessibility, e.featured, e.status, e.legacy_url,
  e.custom_place_name, e.custom_address, e.custom_latitude, e.custom_longitude,
  case when p.id is null then null else json_build_object(
    'id', p.id, 'name', p.name, 'slug', p.slug, 'type', p.type, 'summary', p.summary, 'address', p.address,
    'latitude', p.latitude, 'longitude', p.longitude, 'main_image_path', p.main_image_path,
    'featured', p.featured, 'status', p.status
  ) end as place,
  coalesce((
    select json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color, 'icon', c.icon) order by c.name)
    from public.event_categories ec
    join public.categories c on c.id = ec.category_id and c.status = 'published'
    where ec.event_id = e.id
  ), '[]'::json) as categories`;

function occurrencesColumn(condition: string) {
  return `(
    select json_agg(json_build_object(
      'id', o.id, 'event_id', o.event_id, 'starts_at', o.starts_at, 'ends_at', o.ends_at,
      'all_day', o.all_day, 'status', o.status
    ) order by o.starts_at)
    from public.event_occurrences o
    where o.event_id = e.id and o.status <> 'cancelled' and ${condition}
  ) as event_occurrences`;
}

// Una fecha sigue vigente hasta que termina, así una muestra de un mes no desaparece al día siguiente de abrir.
const pending = "coalesce(o.ends_at, o.starts_at) >= $1";

export async function selectUpcomingEventRows(query: Query, now: Date) {
  return query<EventRow>(`
    select ${eventColumns}, ${occurrencesColumn(pending)}
    from public.events e
    left join public.places p on p.id = e.place_id and p.status = 'published'
    where e.status = 'published'
      and exists (select 1 from public.event_occurrences o where o.event_id = e.id and o.status <> 'cancelled' and ${pending})
  `, [now.toISOString()]);
}

// Incluye fechas pasadas: la ficha de un evento terminado sigue accesible desde enlaces viejos.
export async function selectEventRowBySlug(query: Query, slug: string) {
  const [row] = await query<EventRow>(`
    select ${eventColumns}, ${occurrencesColumn("true")}
    from public.events e
    left join public.places p on p.id = e.place_id and p.status = 'published'
    where e.slug = $1 and e.status = 'published'
      and exists (select 1 from public.event_occurrences o where o.event_id = e.id and o.status <> 'cancelled')
  `, [slug]);
  return row ?? null;
}
