import type { Metadata } from "next";
import { ContentCard } from "@/components/content/content-card";
import { ContentHero } from "@/components/content/content-hero";
import { MAPA_SMT_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Guías y mapas",
  description: "Guía de bolsillo, circuitos turísticos y mapas de San Miguel de Tucumán para recorrer la ciudad a tu ritmo.",
  alternates: { canonical: "/guias" },
};

const guias = [
  {
    foto: "guia-de-bolsillo", title: "Guía de bolsillo", badge: "PDF",
    href: "https://drive.google.com/file/d/1vHKz2u6ZtChv0Xd-Zwt98rLtMoOiqK3c/view",
    text: "Recorré las calles llenas de memoria de la ciudad, desde la emblemática Casa Histórica hasta sus museos, plazas y monumentos.",
  },
  {
    foto: "circuitos", title: "Circuitos turísticos", badge: "PDF",
    href: "https://drive.google.com/file/d/1QmlEthQKRzVUmRdTZsyyhOW4EPQwtRBs/view",
    text: "Una propuesta integral para descubrir la ciudad desde su historia, su arte y su gente.",
  },
  {
    foto: "mapa", title: "Mapa turístico", badge: "PDF",
    href: "https://www.tucumanturismo.gob.ar/public/files/sanmigueltucuman_05luwrn3_05-07-2024.pdf",
    text: "El plano de San Miguel de Tucumán con circuitos, espacios públicos, servicios y atractivos turísticos.",
  },
];

export default function GuidesPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Info útil"
        title="Guías y mapas"
        intro="Guías, planos y folletos para descubrir la ciudad a tu ritmo: historia, cultura y experiencias locales en tu mano."
      />
      <div className="shell place-sections">
        <section aria-label="Guías para descargar">
          <div className="event-grid">
            {guias.map((guia) => (
              <ContentCard key={guia.foto} title={guia.title} text={guia.text} image={`/images/contenido/guias/${guia.foto}.webp`} badge={guia.badge} href={guia.href} cta="Ver la guía" />
            ))}
          </div>
        </section>
        <section className="content-callout" aria-labelledby="mapa-title">
          <div>
            <p className="section-kicker">Mapa interactivo</p>
            <h2 id="mapa-title">La ciudad en un mapa</h2>
            <p>Plazas, espacios verdes, murales, servicios y puntos de interés en el mapa digital de la Municipalidad.</p>
          </div>
          <div className="content-callout-actions">
            <a className="button button-accent" href={MAPA_SMT_URL} target="_blank" rel="noreferrer">Abrir mapa.smt.gob.ar</a>
          </div>
        </section>
      </div>
    </div>
  );
}
