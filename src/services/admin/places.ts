import type { Query } from "@/lib/db";
import type { Place, SocialLinks } from "@/types/domain";

export interface PlaceListItem {
  id: string;
  name: string;
  slug: string;
  type: Place["type"];
  status: Place["status"];
  address: string | null;
  events: number;
  updated_at: Date | string;
}

export interface PlaceAdmin {
  id: string;
  name: string;
  slug: string;
  type: Place["type"];
  status: Place["status"];
  featured: boolean;
  summary: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: { lineas?: string[] } | null;
  services: string[] | null;
  social_links: SocialLinks | null;
  main_image_path: string | null;
  gallery_paths: string[] | null;
}

export interface PlaceInput {
  name: string;
  slug: string;
  type: Place["type"];
  status: Place["status"];
  featured: boolean;
  summary: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: string[];
  services: string[];
  socialLinks: SocialLinks;
  mainImagePath: string | null;
  galleryPaths: string[];
}

export async function listPlacesAdmin(query: Query) {
  return query<PlaceListItem>(`
    select p.id, p.name, p.slug, p.type, p.status, p.address, p.updated_at,
      (select count(*) from public.events e where e.place_id = p.id)::int as events
    from public.places p
    order by p.name`);
}

export async function getPlaceAdmin(query: Query, id: string) {
  const [row] = await query<PlaceAdmin>(`
    select id, name, slug, type, status, featured, summary, description, address, phone, email, website,
      opening_hours, services, social_links, main_image_path, gallery_paths
    from public.places where id = $1`, [id]);
  return row ?? null;
}

/** Lugares para el selector de los eventos, incluidos los borradores (un evento puede prepararse antes). */
export async function placeOptions(query: Query) {
  return query<{ id: string; name: string; status: Place["status"] }>("select id, name, status from public.places order by name");
}

// Los arreglos viajan como texto JSON y se convierten en SQL. El ::text intermedio importa: si el parámetro se
// castea directo a jsonb, postgres.js lo ve como jsonb y vuelve a codificar el texto como un string JSON.
const textArray = (param: string) => `array(select jsonb_array_elements_text(${param}::text::jsonb))`;

export async function savePlace(query: Query, input: PlaceInput, id?: string) {
  const values = [
    input.name, input.slug, input.type, input.status, input.featured, input.summary, input.description,
    input.address, input.phone, input.email, input.website,
    JSON.stringify({ lineas: input.openingHours }), JSON.stringify(input.services), JSON.stringify(input.socialLinks),
    input.mainImagePath, JSON.stringify(input.galleryPaths),
  ];
  const assignments = `name = $1, slug = $2, type = $3::public.place_type, status = $4::public.publication_status,
    featured = $5, summary = $6, description = $7, address = $8, phone = $9, email = $10, website = $11,
    opening_hours = $12::text::jsonb, services = ${textArray("$13")}, social_links = $14::text::jsonb,
    main_image_path = $15, gallery_paths = ${textArray("$16")}`;
  const [row] = id
    ? await query<{ id: string }>(`update public.places set ${assignments} where id = $17 returning id`, [...values, id])
    : await query<{ id: string }>(`
        insert into public.places (name, slug, type, status, featured, summary, description, address, phone, email,
          website, opening_hours, services, social_links, main_image_path, gallery_paths)
        values ($1, $2, $3::public.place_type, $4::public.publication_status, $5, $6, $7, $8, $9, $10, $11,
          $12::text::jsonb, ${textArray("$13")}, $14::text::jsonb, $15, ${textArray("$16")})
        returning id`, values);
  return row?.id ?? null;
}
