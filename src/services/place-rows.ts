import type { Place, SocialLinks } from "@/types/domain";

// PostgreSQL devuelve `numeric` como texto para no perder precisión.
type NumericValue = number | string | null;

export interface PlaceRow {
  id: string;
  name: string;
  slug: string;
  type: Place["type"];
  summary: string | null;
  description: string | null;
  address: string | null;
  latitude: NumericValue;
  longitude: NumericValue;
  opening_hours: { lineas?: string[] } | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  social_links: SocialLinks | null;
  accessibility: string | null;
  services: string[] | null;
  main_image_path: string | null;
  gallery_paths: string[] | null;
  featured: boolean;
  status: Place["status"];
}

export const PLACE_TYPE_LABELS: Record<Place["type"], { one: string; many: string }> = {
  museum: { one: "Museo", many: "Museos" },
  theater: { one: "Teatro", many: "Teatros" },
  cultural_house: { one: "Centro cultural", many: "Centros culturales" },
  heritage: { one: "Patrimonio", many: "Patrimonio histórico" },
  square: { one: "Plaza", many: "Plazas" },
  park: { one: "Parque", many: "Parques" },
  gastronomy: { one: "Gastronomía", many: "Gastronomía" },
  office: { one: "Oficina", many: "Oficinas" },
  other: { one: "Espacio", many: "Otros espacios" },
};

// Las imágenes son URLs completas o rutas del sitio (/media/…); cualquier otra cosa rompería next/image.
function image(path: string | null) {
  return path && (/^https?:\/\//.test(path) || path.startsWith("/")) ? path : undefined;
}

export function mapPlaceRow(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    summary: row.summary ?? "",
    description: row.description ?? undefined,
    address: row.address ?? "",
    latitude: row.latitude === null ? undefined : Number(row.latitude),
    longitude: row.longitude === null ? undefined : Number(row.longitude),
    openingHours: row.opening_hours?.lineas ?? [],
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    socialLinks: row.social_links ?? {},
    accessibility: row.accessibility ?? undefined,
    services: row.services ?? [],
    imageUrl: image(row.main_image_path),
    gallery: (row.gallery_paths ?? []).map(image).filter((path): path is string => Boolean(path)),
    featured: row.featured,
    status: row.status,
  };
}
