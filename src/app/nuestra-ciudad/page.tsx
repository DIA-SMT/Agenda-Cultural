import type { Metadata } from "next";
import Image from "next/image";
import { ContentHero } from "@/components/content/content-hero";

export const metadata: Metadata = {
  title: "Nuestra ciudad",
  description: "San Miguel de Tucumán, Cuna de la Independencia: su historia, su presente y los datos de la ciudad.",
  alternates: { canonical: "/nuestra-ciudad" },
};

const datos = [
  { label: "Fundación", value: "31 de mayo de 1565", text: "Su historia se remonta a la época colonial y sigue viva en sus calles y monumentos." },
  { label: "Superficie", value: "91 km²", text: "Una ciudad compacta y vibrante, con gran diversidad cultural, comercial y urbana." },
  { label: "Población", value: "590.342 habitantes", text: "Censo 2022. Capital del norte argentino, motor económico, educativo y cultural del NOA." },
  { label: "Distintivo", value: "Ciudad histórica", text: "Reconocida por su patrimonio y su papel protagónico en la gesta independentista de 1816." },
  { label: "Clima", value: "Templado subtropical", text: "Invita a recorrerla todo el año, con veranos intensos e inviernos suaves." },
  { label: "Apodos", value: "Jardín de la República · Cuna de la Independencia", text: "Dos nombres que reflejan su belleza natural y su legado histórico." },
];

export default function OurCityPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Nuestra ciudad"
        title="Descubrí San Miguel de Tucumán"
        intro="Donde comenzó la historia, y sigue viva cada día."
        image="/images/contenido/nuestra-ciudad/ciudad-1.webp"
      />
      <div className="shell content-story">
        <section>
          <div className="content-prose">
            <p className="section-kicker">Capital histórica y cultural del Norte Argentino</p>
            <h2>Cuna de la Independencia</h2>
            <p>
              San Miguel de Tucumán no es sólo la ciudad más grande del norte argentino: es también el lugar donde nació
              nuestra independencia. Fue fundada en 1565 por Diego de Villarroel y trasladada a su ubicación actual en
              1685. En sus calles se libró la heroica Batalla de Tucumán y, pocos años después, se declaró aquí la
              Independencia Argentina, el 9 de julio de 1816.
            </p>
            <p>Ese legado la convirtió en la Cuna de la Independencia, y aún hoy se respira historia en sus plazas, edificios y museos.</p>
          </div>
          <figure><Image src="/images/contenido/nuestra-ciudad/ciudad-2.webp" alt="Edificios históricos de San Miguel de Tucumán" fill sizes="(max-width: 900px) 100vw, 50vw" /></figure>
        </section>
        <section>
          <div className="content-prose">
            <p className="section-kicker">Del ferrocarril al presente</p>
            <h2>Una ciudad que creció con el país</h2>
            <p>
              A fines del siglo XIX, con la llegada del ferrocarril y el desarrollo de la industria azucarera, San Miguel
              de Tucumán se convirtió en un polo económico clave para la Argentina. Se construyeron plazas, avenidas,
              servicios públicos, palacios y parques que le dieron su identidad actual.
            </p>
            <p>
              Hoy la ciudad combina su pasado histórico con un presente vibrante. Es sede de universidades, centros
              culturales y espacios naturales que la convierten en un punto estratégico para vivir, estudiar y visitar.
              Sus bulevares arbolados, su gastronomía y su gente invitan a recorrerla a pie, en bici o a bordo del Bus
              Turístico.
            </p>
          </div>
          <figure><Image src="/images/contenido/planifica/recorridos.webp" alt="Iglesias del casco histórico de San Miguel de Tucumán" fill sizes="(max-width: 900px) 100vw, 50vw" /></figure>
        </section>
      </div>
      <section className="shell content-section" aria-labelledby="datos-title">
        <div className="section-heading">
          <div><p className="section-kicker">En números</p><h2 id="datos-title">Una ciudad con historia, identidad y vitalidad</h2></div>
        </div>
        <dl className="facts-grid">
          {datos.map((dato) => (
            <div key={dato.label}>
              <dt>{dato.label}</dt>
              <dd><strong>{dato.value}</strong><span>{dato.text}</span></dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
