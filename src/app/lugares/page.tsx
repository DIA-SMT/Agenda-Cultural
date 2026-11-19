import type { Metadata } from "next";
import { PlaceSections } from "@/components/places/place-sections";
import { getPlaces, groupPlacesByType } from "@/services/places";

export const metadata: Metadata = {
  title: "Lugares para descubrir",
  description: "Museos, teatros, centros culturales, parques y plazas de San Miguel de Tucumán.",
  alternates: { canonical: "/lugares" },
};

export const revalidate = 600;

export default async function PlacesPage() {
  const places = await getPlaces();
  return (
    <div className="page-surface">
      <div className="page-hero">
        <div className="shell">
          <p className="section-kicker">Dónde ir</p>
          <h1>Lugares para descubrir</h1>
          <p>Museos, teatros, centros culturales, parques y plazas de la ciudad.</p>
        </div>
      </div>
      <PlaceSections groups={groupPlacesByType(places)} />
    </div>
  );
}
