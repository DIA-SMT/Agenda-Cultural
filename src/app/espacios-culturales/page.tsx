import type { Metadata } from "next";
import { PlaceSections } from "@/components/places/place-sections";
import { CULTURAL_PLACE_TYPES, getPlaces, groupPlacesByType } from "@/services/places";

export const metadata: Metadata = {
  title: "Espacios culturales",
  description: "Museos, teatros, centros y casas culturales de San Miguel de Tucumán: horarios, direcciones y qué ver en cada uno.",
  alternates: { canonical: "/espacios-culturales" },
};

// Se prerenderiza y se regenera cada 10 minutos para reflejar lo que se cargue en la base.
export const revalidate = 600;

export default async function CulturalSpacesPage() {
  const places = await getPlaces(CULTURAL_PLACE_TYPES);
  return (
    <div className="page-surface">
      <div className="page-hero">
        <div className="shell">
          <p className="section-kicker">Dónde ir</p>
          <h1>Espacios culturales</h1>
          <p>Museos, teatros, centros y casas culturales que resguardan la historia de la ciudad y ofrecen propuestas para vecinos y visitantes.</p>
        </div>
      </div>
      <PlaceSections groups={groupPlacesByType(places, CULTURAL_PLACE_TYPES)} />
    </div>
  );
}
