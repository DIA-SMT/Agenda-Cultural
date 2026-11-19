import { cache } from "react";
import aireLibre from "../../db/contenido/espacios-al-aire-libre.json";
import contenido from "../../db/contenido/espacios-culturales.json";
import { demoPlaces } from "@/data/demo";
import { isDatabaseConfigured, query } from "@/lib/db";
import { selectPlaceRowBySlug, selectPublishedPlaceRows } from "@/services/place-queries";
import { mapPlaceRow, PLACE_TYPE_LABELS } from "@/services/place-rows";
import type { Place, SocialLinks } from "@/types/domain";

// El orden también es el de las secciones en los listados.
export const CULTURAL_PLACE_TYPES: Place["type"][] = ["museum", "theater", "cultural_house", "heritage", "other"];
export const OUTDOOR_PLACE_TYPES: Place["type"][] = ["park", "square"];
const ALL_PLACE_TYPES = Object.keys(PLACE_TYPE_LABELS) as Place["type"][];

// Espacios culturales, parques y plazas relevados del sitio anterior.
const contentEntries = [...contenido.espacios, ...aireLibre.espacios];
type ContentEntry = (typeof contentEntries)[number];

// Sin DATABASE_URL se muestran los espacios relevados del sitio anterior, con las fotos todavía alojadas allá.
// Con base, los mismos archivos se importan con scripts/importar-espacios.mjs y las fotos pasan a /media.
function mapContentEntry(entry: ContentEntry): Place {
  return {
    id: `contenido-${entry.slug}`,
    name: entry.name,
    slug: entry.slug,
    type: entry.type as Place["type"],
    summary: entry.summary,
    description: entry.description.join("\n\n"),
    address: entry.address ?? "",
    latitude: entry.latitude ?? undefined,
    longitude: entry.longitude ?? undefined,
    openingHours: entry.opening_hours,
    phone: entry.phone ?? undefined,
    socialLinks: entry.social_links as SocialLinks,
    services: entry.services,
    imageUrl: entry.image,
    gallery: entry.gallery,
    featured: false,
    status: "published",
  };
}

const byName = (a: Place, b: Place) => a.name.localeCompare(b.name, "es-AR");

export const getPlaces = cache(async (types: Place["type"][] = ALL_PLACE_TYPES): Promise<Place[]> => {
  const places = isDatabaseConfigured
    ? (await selectPublishedPlaceRows(query, types)).map(mapPlaceRow)
    : contentEntries.map(mapContentEntry).filter((place) => types.includes(place.type));
  return places.sort(byName);
});

export const getPlaceBySlug = cache(async (slug: string): Promise<Place | null> => {
  if (isDatabaseConfigured) {
    const row = await selectPlaceRowBySlug(query, slug);
    return row ? mapPlaceRow(row) : null;
  }
  // Los lugares de demostración siguen existiendo para que los eventos de demo tengan adónde enlazar.
  const demo = [...contentEntries.map(mapContentEntry), ...demoPlaces];
  return demo.find((place) => place.slug === slug) ?? null;
});

export function groupPlacesByType(places: Place[], order: Place["type"][] = ALL_PLACE_TYPES) {
  return order
    .map((type) => ({ type, label: PLACE_TYPE_LABELS[type].many, places: places.filter((place) => place.type === type) }))
    .filter((group) => group.places.length > 0);
}
