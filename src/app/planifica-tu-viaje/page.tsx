import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BedDouble, Car, ExternalLink, MapPin, Plane } from "lucide-react";
import { ContentCard } from "@/components/content/content-card";
import { ContentHero } from "@/components/content/content-hero";
import { mapsDirections } from "@/lib/links";

export const metadata: Metadata = {
  title: "Planificá tu viaje",
  description: "Cómo llegar a San Miguel de Tucumán en avión, ómnibus o tren, dónde alojarte, agencias, alquiler de autos y escapadas cercanas.",
  alternates: { canonical: "/planifica-tu-viaje" },
};

// Guías que mantiene la Dirección de Turismo (documentos de Google).
const GUIAS = {
  hoteles: "https://docs.google.com/document/d/1kXBwfBl1tJVZb6BFFMJeacW2yGH0pwtS",
  agencias: "https://docs.google.com/document/d/1HxkuUMsAMloEM_muzirToK0fCYpzjh-y/edit",
  autos: "https://docs.google.com/document/d/1KHTC4fyjbJO8yhJw-zRgnReUbikq8NMG/edit",
};

const llegar = [
  {
    foto: "aeropuerto", title: "En avión", lugar: "Aeropuerto Internacional Benjamín Matienzo", latitude: -26.835779, longitude: -65.108794,
    text: "A 9 km del centro, con vuelos desde las principales ciudades del país y conexiones internacionales. Hay taxis, remises y transporte urbano hasta la ciudad.",
  },
  {
    foto: "terminal", title: "En ómnibus o auto", lugar: "Terminal de Ómnibus", latitude: -26.835609, longitude: -65.195137,
    text: "La ciudad se conecta con el país por las rutas nacionales 9, 38, 34, 40, 64, 65 y 157. La terminal recibe servicios diarios desde numerosos destinos.",
  },
  {
    foto: "tren", title: "En tren", lugar: "Estación Tucumán Mitre", latitude: -26.821066, longitude: -65.211022,
    text: "El servicio Retiro–Tucumán (línea Mitre) une Buenos Aires con la capital tucumana con salidas semanales. La estación está cerca del centro.",
  },
];

const cerca = [
  {
    foto: "escapadas", title: "Escapadas naturales",
    text: "A menos de una hora: El Cadillal con deportes náuticos y miradores, San Javier con selva de yungas y senderos, Raco y El Siambón con turismo rural, y Villa Nougués con arquitectura europea y vistas panorámicas.",
  },
  {
    foto: "recorridos", title: "Recorridos culturales", href: "/espacios-culturales",
    text: "Circuitos guiados, museos, teatros, plazas históricas y espacios patrimoniales. El casco histórico se recorre a pie o en el Bus Turístico gratuito.",
  },
  {
    foto: "excursiones", title: "Excursiones recomendadas",
    text: "Circuitos histórico-culturales, museos y casas patrimoniales, el Parque 9 de Julio, peñas tradicionales y salidas de día completo a los Valles Calchaquíes y otros destinos de la provincia.",
  },
];

export default function PlanYourTripPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Info útil"
        title="Planificá tu viaje"
        intro="Todo lo que necesitás para organizar tu llegada y disfrutar al máximo tu estadía: transporte, alojamiento, excursiones y servicios."
        image="/images/contenido/planifica/excursiones.webp"
      />
      <div className="shell place-sections">
        <section aria-labelledby="llegar-title">
          <div className="section-heading">
            <div><p className="section-kicker">Cómo llegar</p><h2 id="llegar-title">Llegar a San Miguel de Tucumán</h2></div>
          </div>
          <div className="event-grid">
            {llegar.map((item) => (
              <ContentCard key={item.foto} title={item.title} text={item.text} image={`/images/contenido/planifica/${item.foto}.webp`} href={mapsDirections(item.latitude, item.longitude)} cta="Ver en el mapa">
                <p className="event-place"><MapPin size={17} /> <span>{item.lugar}</span></p>
              </ContentCard>
            ))}
          </div>
        </section>

        <section className="content-callout" aria-labelledby="servicios-title">
          <div>
            <p className="section-kicker">Servicios turísticos</p>
            <h2 id="servicios-title">Dónde dormir y cómo moverte</h2>
            <p>Guías para elegir hoteles, hostels y departamentos temporarios, y para encontrar agencias, excursiones y alquiler de autos.</p>
          </div>
          <div className="content-callout-actions">
            <a className="button button-accent" href={GUIAS.hoteles} target="_blank" rel="noreferrer"><BedDouble size={18} /> Alojamiento <ExternalLink size={16} /></a>
            <a className="button button-outline-light" href={GUIAS.agencias} target="_blank" rel="noreferrer"><Plane size={18} /> Agencias de viaje <ExternalLink size={16} /></a>
            <a className="button button-outline-light" href={GUIAS.autos} target="_blank" rel="noreferrer"><Car size={18} /> Alquiler de autos <ExternalLink size={16} /></a>
          </div>
        </section>

        <section aria-labelledby="cerca-title">
          <div className="section-heading">
            <div><p className="section-kicker">Más allá del centro</p><h2 id="cerca-title">Qué podés hacer cerca de la ciudad</h2></div>
          </div>
          <div className="event-grid">
            {cerca.map((item) => <ContentCard key={item.foto} title={item.title} text={item.text} image={`/images/contenido/planifica/${item.foto}.webp`} href={item.href} />)}
          </div>
        </section>

        <nav className="content-links content-links-row" aria-label="Más información útil">
          <Link href="/guias">Guías y mapas <ArrowRight size={18} /></Link>
          <Link href="/oficinas">Oficinas de información <ArrowRight size={18} /></Link>
          <Link href="/preguntas-frecuentes">Preguntas frecuentes <ArrowRight size={18} /></Link>
        </nav>
      </div>
    </div>
  );
}
