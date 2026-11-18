import type { Query } from "@/lib/db";
import type { PlaceRow } from "@/services/place-rows";
import type { Place } from "@/types/domain";

const placeColumns = `
  id, name, slug, type, summary, description, address, latitude, longitude, opening_hours, phone, email,
  website, social_links, accessibility, services, main_image_path, gallery_paths, featured, status`;

// Los tipos van como texto separado por comas: así el parámetro es igual en postgres.js y en PGlite.
export async function selectPublishedPlaceRows(query: Query, types: Place["type"][]) {
  return query<PlaceRow>(`
    select ${placeColumns}
    from public.places
    where status = 'published' and type = any(string_to_array($1, ',')::public.place_type[])
  `, [types.join(",")]);
}

export async function selectPlaceRowBySlug(query: Query, slug: string) {
  const [row] = await query<PlaceRow>(`
    select ${placeColumns} from public.places where slug = $1 and status = 'published'
  `, [slug]);
  return row ?? null;
}
