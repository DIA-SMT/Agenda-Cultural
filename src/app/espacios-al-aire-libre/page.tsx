import type { Metadata } from "next";
import { MapIcon } from "lucide-react";
import { ContentCard } from "@/components/content/content-card";
import { ContentHero } from "@/components/content/content-hero";
import { PlaceCard } from "@/components/places/place-card";
import { MAPA_SMT_URL } from "@/lib/links";
import { getPlaces, OUTDOOR_PLACE_TYPES } from "@/services/places";

export const metadata: Metadata = {
  title: "Espacios al aire libre",
  description: "Parques, plazas, murales y el museo escultórico a cielo abierto de San Miguel de Tucumán.",
  alternates: { canonical: "/espacios-al-aire-libre" },
};

// Parques y plazas salen de la base (se editan en el panel, en Lugares); se regenera cada 10 minutos.
export const revalidate = 600;

export default async function OutdoorPage() {
  const places = await getPlaces(OUTDOOR_PLACE_TYPES);
  const parks = places.filter((place) => place.type === "park");
  const squares = places.filter((place) => place.type === "square");

  return (
    <div className="page-surface">
      <ContentHero
        kicker="Dónde ir"
        title="Espacios al aire libre"
        intro="Plazas, parques, paseos y murales para disfrutar la naturaleza, el arte urbano y los rincones más emblemáticos de la ciudad."
        image="/images/contenido/aire-libre/parques.webp"
      />
      <div className="shell place-sections">
        {parks.length > 0 && (
          <section id="parques" aria-labelledby="parques-title">
            <div className="section-heading">
              <div><p className="section-kicker">Pulmones verdes</p><h2 id="parques-title">Parques</h2></div>
            </div>
            <div className="event-grid">{parks.map((place) => <PlaceCard key={place.id} place={place} />)}</div>
          </section>
        )}
        {squares.length > 0 && (
          <section id="plazas" aria-labelledby="plazas-title">
            <div className="section-heading">
              <div><p className="section-kicker">Historia y encuentro</p><h2 id="plazas-title">Plazas</h2></div>
            </div>
            <div className="event-grid">{squares.map((place) => <PlaceCard key={place.id} place={place} />)}</div>
          </section>
        )}
        <section aria-labelledby="arte-title">
          <div className="section-heading">
            <div><p className="section-kicker">Arte a cielo abierto</p><h2 id="arte-title">Recorridos por la ciudad</h2></div>
          </div>
          <div className="event-grid">
            <ContentCard
              title="Pintamos la ciudad que queremos"
              text="Cien murales de artistas locales que transforman las calles en una galería a cielo abierto."
              image="/images/contenido/murales/portada.webp"
              badge="Murales"
              href="/pintamos-la-ciudad-que-queremos"
              cta="Ver los murales"
            />
            <ContentCard
              title="Museo escultórico a cielo abierto"
              text="Un recorrido guiado por las esculturas clásicas del Parque 9 de Julio, con un concierto al final."
              image="/images/contenido/museo-a-cielo-abierto/portada.webp"
              badge="Recorrido guiado"
              href="/museo-escultorico-a-cielo-abierto"
            />
            <ContentCard
              title="Mapa de la ciudad"
              text="Encontrá más plazas, espacios verdes y murales en el mapa interactivo de la Municipalidad."
              image="/images/contenido/aire-libre/plazas.webp"
              badge="Mapa interactivo"
              href={MAPA_SMT_URL}
              cta="Abrir el mapa"
            >
              <p className="event-place"><MapIcon size={17} /> <span>mapa.smt.gob.ar</span></p>
            </ContentCard>
          </div>
        </section>
      </div>
    </div>
  );
}
