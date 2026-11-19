import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContentHero } from "@/components/content/content-hero";
import { PhotoGallery } from "@/components/content/photo-gallery";

export const metadata: Metadata = {
  title: "Ferias municipales",
  description: "Artesanos, gastronomía y emprendimientos locales en las ferias de San Miguel de Tucumán.",
  alternates: { canonical: "/ferias-municipales" },
};

const fotos = ["09", "01", "08", "04", "05", "03", "02", "07", "12", "10", "06", "13"].map((n, i) => ({
  src: `/images/contenido/ferias/feria-${n}.webp`,
  alt: `Feria municipal en San Miguel de Tucumán, foto ${i + 1} de 12`,
}));

// Las ferias se cargan como eventos: estos accesos llevan a las que vienen.
const agenda = [
  { label: "Ferias de emprendedores", href: "/agenda?category=ferias-emprendedores" },
  { label: "Ferias gastronómicas", href: "/agenda?category=ferias-gastronomicas" },
  { label: "Todas las ferias", href: "/agenda?q=feria" },
];

export default function FairsPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Imperdibles de la ciudad"
        title="Ferias municipales"
        intro="Artesanos, gastronomía y emprendimientos locales en espacios para recorrer y disfrutar."
        image="/images/contenido/ferias/feria-01.webp"
      />
      <div className="shell content-layout">
        <div className="content-prose">
          <p>
            Las ferias municipales son puntos de encuentro de artesanos, cocineros y emprendedores locales. Son ideales
            para recorrer en familia, probar sabores de la región, llevarse algo hecho en Tucumán y descubrir la
            identidad de la ciudad.
          </p>
        </div>
        <nav className="content-links" aria-label="Ferias en la agenda">
          <p className="section-kicker">¿Cuándo es la próxima?</p>
          {agenda.map((item) => <Link key={item.href} href={item.href}>{item.label} <ArrowRight size={18} /></Link>)}
        </nav>
      </div>
      <section className="shell content-section" aria-labelledby="ferias-title">
        <div className="section-heading">
          <div><p className="section-kicker">Galería</p><h2 id="ferias-title">Así se viven las ferias</h2></div>
        </div>
        <PhotoGallery photos={fotos} label="Ferias municipales" />
      </section>
    </div>
  );
}
