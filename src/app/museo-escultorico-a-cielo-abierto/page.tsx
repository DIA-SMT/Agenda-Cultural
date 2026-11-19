import type { Metadata } from "next";
import Link from "next/link";
import { Bus, CalendarClock, ExternalLink, MapPin, Music } from "lucide-react";
import { ContentHero } from "@/components/content/content-hero";
import { MapEmbed } from "@/components/content/map-embed";
import { PhotoGallery } from "@/components/content/photo-gallery";
import { BUS_INSCRIPCION_URL, mapsDirections, REDES_TURISMO } from "@/lib/links";

export const metadata: Metadata = {
  title: "Museo escultórico a cielo abierto",
  description: "Recorrido guiado por las esculturas clásicas del Parque 9 de Julio, con concierto de cierre junto al Reloj Floral.",
  alternates: { canonical: "/museo-escultorico-a-cielo-abierto" },
};

const obras = [
  "Diana y Endimión (punto de partida)", "La Vestal", "La Meditación", "Apolo de Belvedere", "Fauno danzante", "Idilio",
  "Venus de Milo", "Alegoría al Invierno", "Venus del baño", "Familia Laocoonte", "Venus y Cupido", "Galo Moribundo",
  "Venus de Medici (junto al Reloj Floral, cierre del recorrido)",
];

const contenidos = [
  { title: "Arte y mitología", text: "Referencias clásicas, simbolismos y relatos asociados a cada obra." },
  { title: "Historia y restauración", text: "Procesos de conservación y puesta en valor de las esculturas." },
  { title: "Estado actual", text: "Las obras pendientes de restauración y los planes de intervención, con una breve explicación del proceso de restauración de una pieza." },
  { title: "Patrimonio natural", text: "Reseña histórica del Parque 9 de Julio y su vegetación característica." },
];

const fotos = ["03", "06", "05", "04", "02", "01"].map((n, i) => ({
  src: `/images/contenido/museo-a-cielo-abierto/escultura-${n}.webp`,
  alt: `Escultura del Parque 9 de Julio, foto ${i + 1} de 6`,
}));

// Rotonda del Parque 9 de Julio, junto a "Diana y Endimión": el punto de partida del recorrido.
const partida = { latitude: -26.832616, longitude: -65.193948 };

export default function SculptureMuseumPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="City tour · Parque 9 de Julio"
        title="Museo escultórico a cielo abierto"
        intro="Un recorrido guiado por las esculturas clásicas del Parque 9 de Julio, que integra arte, historia y naturaleza."
        image="/images/contenido/museo-a-cielo-abierto/circuito.webp"
      >
        <div className="hero-actions">
          <a className="button button-accent" href={BUS_INSCRIPCION_URL} target="_blank" rel="noreferrer">Inscribirme <ExternalLink size={18} /></a>
        </div>
      </ContentHero>

      <div className="shell detail-layout">
        <div className="detail-main">
          <section>
            <h2>Sobre el recorrido</h2>
            <p>
              Este paseo propone descubrir el valor artístico y paisajístico del Parque 9 de Julio a través de su colección
              de esculturas clásicas. La experiencia combina arte, historia, mitología y patrimonio natural, e incluye
              intervenciones artísticas y un concierto final a cargo del grupo “Las Damas de Bronce” en las inmediaciones
              del Reloj Floral.
            </p>
            <p>
              Además de conocer obras emblemáticas, se comparten detalles sobre su conservación, los procesos de
              restauración y el desarrollo del parque diseñado por Carlos Thays.
            </p>
          </section>
          <section>
            <h2>Obras incluidas</h2>
            <ol className="content-steps">{obras.map((obra) => <li key={obra}>{obra}</li>)}</ol>
          </section>
          <section>
            <h2>Qué se cuenta en el guiado</h2>
            <div className="content-points">
              {contenidos.map((item) => <div key={item.title}><strong>{item.title}</strong><p>{item.text}</p></div>)}
            </div>
          </section>
          <section>
            <h2>Espectáculo de cierre</h2>
            <p>
              El grupo “Las Damas de Bronce” interpreta un repertorio de obras clásicas y contemporáneas que acompaña el
              entorno escultórico y natural del parque. Dura 30 minutos y se hace en el sector próximo al Reloj Floral.
            </p>
          </section>
          <section>
            <h2>Galería</h2>
            <PhotoGallery photos={fotos} label="Esculturas del Parque 9 de Julio" />
          </section>
          <section>
            <h2>Punto de partida</h2>
            <MapEmbed {...partida} title="Rotonda del Parque 9 de Julio, junto a Diana y Endimión" />
          </section>
        </div>

        <aside className="event-facts" aria-label="Datos del recorrido">
          <div><CalendarClock /><span><small>Cuándo</small><strong>Viernes, 19:30 h</strong></span></div>
          <div><Bus /><span><small>Salida del bus</small><strong>Plaza Independencia</strong></span></div>
          <div><MapPin /><span><small>Inicio del recorrido</small><strong>Rotonda del Parque 9 de Julio</strong><em>Junto a la escultura “Diana y Endimión”</em></span></div>
          <div><Music /><span><small>Cierre</small><strong>Concierto de 30 minutos</strong><em>Junto al Reloj Floral</em></span></div>
          <div><ExternalLink /><span><small>Turismo SMT</small>{REDES_TURISMO.map((red) => <a key={red.href} href={red.href} target="_blank" rel="noreferrer">{red.label}</a>)}</span></div>
          <a className="button button-primary" href={BUS_INSCRIPCION_URL} target="_blank" rel="noreferrer">Inscribirme</a>
          <a className="button button-secondary" href={mapsDirections(partida.latitude, partida.longitude)} target="_blank" rel="noreferrer">Cómo llegar</a>
          <Link className="content-aside-link" href="/lugares/parque-9-de-julio">Conocé el Parque 9 de Julio</Link>
        </aside>
      </div>
    </div>
  );
}
