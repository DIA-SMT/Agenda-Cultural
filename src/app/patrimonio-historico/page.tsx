import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { ContentCard } from "@/components/content/content-card";
import { ContentHero } from "@/components/content/content-hero";

export const metadata: Metadata = {
  title: "Patrimonio histórico",
  description: "Museos, templos, parques y edificios que resguardan la historia y la identidad de San Miguel de Tucumán.",
  alternates: { canonical: "/patrimonio-historico" },
};

// Los que tienen página propia en la Agenda enlazan ahí; el resto, a cómo llegar.
const lugares = [
  {
    foto: "casa-historica", title: "Casa Histórica", address: "Congreso de Tucumán 141", href: "/lugares/casa-historica",
    text: "Sitio donde la Argentina declaró su independencia. Museo emblemático, con espectáculos nocturnos de luces y sonido y visitas guiadas.",
  },
  {
    foto: "mia", title: "Museo de la Industria Azucarera (MIA)", address: "Parque 9 de Julio", href: "/lugares/museo-de-la-industria-azucarera-mia",
    text: "En la casa del Obispo Colombres se recorre la historia azucarera tucumana, con su instrumental original.",
  },
  {
    foto: "museo-historico-provincial", title: "Museo Histórico Provincial", address: "Congreso de Tucumán 56",
    text: "La legendaria casa de las cien puertas, que alberga objetos que narran la historia de Tucumán.",
  },
  {
    foto: "museo-de-ciencias-naturales", title: "Museo de Ciencias Naturales", address: "Miguel Lillo 251",
    text: "Para explorar la fauna y la flora tucumanas, con colecciones de mamíferos y otras especies y un jardín botánico visitable.",
  },
  {
    foto: "parque-9-de-julio", title: "Parque 9 de Julio", address: "Av. Soldati 100", href: "/lugares/parque-9-de-julio",
    text: "Amplio parque urbano con lagos, bares y juegos, ideal para pasar la tarde en familia rodeados de naturaleza.",
  },
  {
    foto: "la-merced", title: "Basílica Nuestra Señora de la Merced", address: "24 de Septiembre 253",
    text: "Templo monumental que resguarda reliquias patrias y la venerada imagen de la Virgen Generala del Ejército Argentino.",
  },
];

export default function HeritagePage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Patrimonio"
        title="Patrimonio histórico"
        intro="Descubrí los museos, plazas y edificios que resguardan la historia, la memoria y la identidad de nuestra ciudad."
        image="/images/contenido/nuestra-ciudad/ciudad-2.webp"
      />
      <div className="shell place-sections">
        <section aria-label="Lugares históricos">
          <div className="event-grid">
            {lugares.map((lugar) => (
              <ContentCard
                key={lugar.title}
                title={lugar.title}
                text={lugar.text}
                image={`/images/contenido/patrimonio/${lugar.foto}.webp`}
                href={lugar.href ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lugar.address}, San Miguel de Tucumán`)}`}
                cta={lugar.href ? "Conocé más" : "Cómo llegar"}
              >
                <p className="event-place"><MapPin size={17} /> <span>{lugar.address}</span></p>
              </ContentCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
