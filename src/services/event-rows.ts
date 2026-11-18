import type { AccessType, Category, CulturalEvent, EventOccurrence, EventStatus, Place } from "@/types/domain";

export const DEFAULT_EVENT_IMAGE = "/images/hero-cultura-smt.jpg";
const DEFAULT_CATEGORY_COLOR = "#0274BE";

// PostgreSQL devuelve `numeric` como texto para no perder precisión.
type NumericValue = number | string | null;

interface PlaceRow {
  id: string;
  name: string;
  slug: string;
  type: Place["type"];
  summary: string | null;
  address: string | null;
  latitude: NumericValue;
  longitude: NumericValue;
  main_image_path: string | null;
  featured: boolean;
  status: Place["status"];
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
}

interface OccurrenceRow {
  id: string;
  event_id: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  status: EventOccurrence["status"];
}

export interface EventRow {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  main_image_path: string | null;
  organizer: string | null;
  price: string | null;
  access_type: AccessType;
  registration_url: string | null;
  ticket_url: string | null;
  accessibility: string | null;
  featured: boolean;
  status: EventStatus;
  legacy_url: string | null;
  custom_place_name: string | null;
  custom_address: string | null;
  custom_latitude: NumericValue;
  custom_longitude: NumericValue;
  place: PlaceRow | null;
  categories: CategoryRow[];
  // json_agg devuelve null cuando no hay filas.
  event_occurrences: OccurrenceRow[] | null;
}

// Las imágenes se guardan como URL completa (p. ej. las importadas de WordPress) o como ruta del propio
// sitio (/media/…, servida por nginx). Cualquier otra cosa rompería next/image, así que se descarta.
function resolveImage(path: string | null) {
  return path && (/^https?:\/\//.test(path) || path.startsWith("/")) ? path : undefined;
}

function optionalNumber(value: NumericValue) {
  return value === null ? undefined : Number(value);
}

function mapPlace(row: EventRow): Place {
  if (row.place) {
    return {
      id: row.place.id,
      name: row.place.name,
      slug: row.place.slug,
      type: row.place.type,
      summary: row.place.summary ?? "",
      address: row.place.address ?? "",
      latitude: optionalNumber(row.place.latitude),
      longitude: optionalNumber(row.place.longitude),
      imageUrl: resolveImage(row.place.main_image_path),
      featured: row.place.featured,
      status: row.place.status,
    };
  }

  // Lugar cargado a mano en el evento (o un lugar todavía no publicado, que la consulta no trae).
  return {
    id: `custom-${row.id}`,
    name: row.custom_place_name ?? "Lugar a confirmar",
    slug: "",
    type: "other",
    summary: "",
    address: row.custom_address ?? "",
    latitude: optionalNumber(row.custom_latitude),
    longitude: optionalNumber(row.custom_longitude),
    featured: false,
    status: "published",
  };
}

function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, color: row.color ?? DEFAULT_CATEGORY_COLOR, icon: row.icon ?? undefined };
}

function mapOccurrence(row: OccurrenceRow): EventOccurrence {
  return {
    id: row.id,
    eventId: row.event_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    allDay: row.all_day,
    timezone: "America/Argentina/Tucuman",
    status: row.status,
  };
}

export function mapEventRow(row: EventRow): CulturalEvent {
  const place = mapPlace(row);
  const occurrences = (row.event_occurrences ?? [])
    .filter((occurrence) => occurrence.status !== "cancelled")
    .map(mapOccurrence)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? "",
    description: row.description ?? row.summary ?? "",
    imageUrl: resolveImage(row.main_image_path) ?? place.imageUrl ?? DEFAULT_EVENT_IMAGE,
    place,
    categories: row.categories.map(mapCategory),
    occurrences,
    organizer: row.organizer ?? undefined,
    price: row.price ?? undefined,
    accessType: row.access_type,
    registrationUrl: row.registration_url ?? undefined,
    ticketUrl: row.ticket_url ?? undefined,
    accessibility: row.accessibility ?? undefined,
    featured: row.featured,
    status: row.status,
    legacyUrl: row.legacy_url ?? undefined,
  };
}
