import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ContentCard } from "@/components/content/content-card";
import { ContentHero } from "@/components/content/content-hero";

export const metadata: Metadata = {
  title: "Gastronomía tucumana",
  description: "Empanadas, sándwich de milanesa, achilata y dulces de miel de caña: los sabores típicos de San Miguel de Tucumán, y dónde probarlos.",
  alternates: { canonical: "/gastronomia" },
};

// Guía de bares y peñas que armó la Dirección de Turismo (documento de Google).
const GUIA_BARES_Y_PENAS = "https://docs.google.com/document/d/1hiAyyZb7E72eculMzxsS-KF-T7GHyuq2/edit";

const platos = [
  { slug: "empanadas", title: "Empanadas", text: "Producto emblemático de la cocina tucumana, reconocido por su calidad y autenticidad." },
  { slug: "sandwich-de-milanesa", title: "Sándwich de milanesa", text: "Crujido perfecto al primer mordisco: pan dorado, milanesa tierna y ese contraste fresco que conquista a todos." },
  { slug: "panchuque", title: "Panchuque", text: "Masa que envuelve una salchicha dorada: simple, tentador y perfecto para comer sin pensarlo dos veces." },
];

const dulces = [
  { slug: "achilata", title: "Achilata", text: "Frescura intensa con textura cristalina: dulce, liviana y perfecta para refrescar el día." },
  { slug: "alfajores-de-miel-de-cana", title: "Alfajores de miel de caña", text: "Conocidos en la ciudad como “claritas”, son verdaderos íconos de la dulzura tucumana." },
  { slug: "alfeniques", title: "Alfeñiques", text: "Caramelos retorcidos de miel de caña, uno de los dulces más tradicionales de la provincia." },
];

export default function GastronomyPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Gastronomía tucumana"
        title="Sabores auténticos del norte argentino"
        intro="Tucumán es sabor y tradición. Desde la empanada clásica hasta sus postres típicos, cada plato cuenta la historia y la identidad del Norte."
        image="/images/contenido/gastronomia/empanadas.webp"
      />
      <div className="shell place-sections">
        <section aria-labelledby="platos-title">
          <div className="section-heading">
            <div><p className="section-kicker">Para probar sí o sí</p><h2 id="platos-title">Clásicos tucumanos</h2></div>
          </div>
          <div className="event-grid">
            {platos.map((item) => <ContentCard key={item.slug} title={item.title} text={item.text} image={`/images/contenido/gastronomia/${item.slug}.webp`} />)}
          </div>
        </section>
        <section aria-labelledby="dulces-title">
          <div className="section-heading">
            <div><p className="section-kicker">Con miel de caña</p><h2 id="dulces-title">Dulces y refrescos</h2></div>
          </div>
          <div className="event-grid">
            {dulces.map((item) => <ContentCard key={item.slug} title={item.title} text={item.text} image={`/images/contenido/gastronomia/${item.slug}.webp`} />)}
          </div>
        </section>
        <section className="content-callout" aria-labelledby="bares-title">
          <div>
            <p className="section-kicker">De noche</p>
            <h2 id="bares-title">Bares y peñas</h2>
            <p>Una guía para conocer las peñas tradicionales y los bares que hacen vibrar la vida nocturna tucumana.</p>
          </div>
          <div className="content-callout-actions">
            <a className="button button-accent" href={GUIA_BARES_Y_PENAS} target="_blank" rel="noreferrer">Ver la guía de bares y peñas <ExternalLink size={18} /></a>
            <Link className="button button-outline-light" href="/agenda?category=ferias-gastronomicas">Ferias gastronómicas en la agenda <ArrowRight size={18} /></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
