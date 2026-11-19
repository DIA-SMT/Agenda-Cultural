import type { Metadata } from "next";
import { MapIcon } from "lucide-react";
import { ContentHero } from "@/components/content/content-hero";
import { PhotoGallery } from "@/components/content/photo-gallery";
import { MAPA_SMT_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Pintamos la ciudad que queremos",
  description: "Murales de artistas locales que transforman el espacio público de San Miguel de Tucumán en una galería a cielo abierto.",
  alternates: { canonical: "/pintamos-la-ciudad-que-queremos" },
};

const murales = Array.from({ length: 21 }, (_, i) => ({
  src: `/images/contenido/murales/mural-${String(i + 1).padStart(2, "0")}.webp`,
  alt: `Mural del proyecto Pintamos la ciudad que queremos, foto ${i + 1} de 21`,
}));

export default function MuralsPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Arte urbano"
        title="Pintamos la ciudad que queremos"
        intro="Murales que transforman el espacio público con arte local."
        image="/images/contenido/murales/mural-10.webp"
      />
      <div className="shell content-layout">
        <div className="content-prose">
          <p>
            “Pintamos la ciudad que queremos” es un proyecto que impulsa la creación de murales en distintos barrios,
            convirtiendo las calles en una galería a cielo abierto, con obras que reflejan la identidad, las historias y
            las expresiones propias de San Miguel de Tucumán.
          </p>
          <p>
            Las obras incluyen retratos, paisajes, símbolos culturales y piezas contemporáneas que enriquecen el paisaje
            urbano y acercan el arte a vecinos y visitantes. El proceso reúne a artistas consagrados y jóvenes emergentes,
            promueve la participación comunitaria y resignifica los espacios públicos.
          </p>
          <p>Los murales ya tomaron forma en distintos puntos de la ciudad: te invitamos a recorrerlos y a vivir el arte en primera persona.</p>
        </div>
        <dl className="content-stats" aria-label="El proyecto en números">
          <div><dt>Artistas que se presentaron</dt><dd>+400</dd></div>
          <div><dt>Murales seleccionados</dt><dd>100</dd></div>
          <div><dt>Dónde</dt><dd>Toda la capital</dd></div>
        </dl>
      </div>
      <section className="shell content-section" aria-labelledby="murales-title">
        <div className="section-heading">
          <div><p className="section-kicker">Galería</p><h2 id="murales-title">Conocé algunos murales</h2></div>
          <a href={MAPA_SMT_URL} target="_blank" rel="noreferrer"><MapIcon size={18} /> Ubicalos en el mapa</a>
        </div>
        <PhotoGallery photos={murales} label="Murales de Pintamos la ciudad que queremos" />
      </section>
    </div>
  );
}
