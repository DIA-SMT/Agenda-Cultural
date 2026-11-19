import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Bus, Trees } from "lucide-react";
import { DemoNotice } from "@/components/demo-notice";
import { EventGrid } from "@/components/events/event-grid";
import { Hero } from "@/components/hero";
import { categoryEmoji } from "@/lib/category-emoji";
import { isDatabaseConfigured } from "@/lib/db";
import { BUS_TURISTICO_URL } from "@/lib/links";
import { formatLongDate } from "@/lib/format";
import { getEvents, getPopularCategories } from "@/services/events";

// La portada se prerenderiza; se regenera cada 5 minutos para reflejar la agenda y la fecha del día.
export const revalidate = 300;

export default async function HomePage() {
  const [events, categories] = await Promise.all([getEvents({ pageSize: 3 }), getPopularCategories(4)]);

  return (
    <>
      <Hero todayLabel={formatLongDate(new Date())} hasOfficialData={isDatabaseConfigured} categories={categories.slice(0, 3)} />
      <div className="shell"><DemoNotice /></div>
      <section className="section shell" aria-labelledby="next-events">
        <div className="section-heading">
          <div><p className="section-kicker">Agenda</p><h2 id="next-events">Próximos eventos</h2></div>
          <Link href="/agenda">Ver agenda completa <ArrowRight size={18} /></Link>
        </div>
        <EventGrid events={events.items} />
      </section>
      {categories.length > 0 && <section className="category-section">
        <div className="shell">
          <div className="section-heading light">
            <div><p className="section-kicker">Encontrá tu plan</p><h2>Explorá por categoría</h2></div>
          </div>
          {/* Las categorías con más actividades por venir, para que ningún acceso lleve a una agenda vacía. */}
          <ul className="category-grid">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link className="category-card" href={`/agenda?category=${encodeURIComponent(category.slug)}`}>
                  <span className="category-sticker" aria-hidden="true">{categoryEmoji(category)}</span>
                  <span className="category-text">
                    <strong>{category.name}</strong>
                    <small>{category.count} {category.count === 1 ? "actividad" : "actividades"} por venir</small>
                  </span>
                  <ArrowRight className="category-arrow" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>}
      <section className="section shell" aria-labelledby="places-title">
        <div className="section-heading">
          <div><p className="section-kicker">Recorré la ciudad</p><h2 id="places-title">Lugares que no te podés perder</h2></div>
          <Link href="/lugares">Explorar lugares <ArrowRight size={18} /></Link>
        </div>
        <div className="places-feature">
          <Link href="/espacios-culturales" className="place-large">
            <Image src="/images/hero-cultura-smt.jpg" alt="Mural urbano en San Miguel de Tucumán" fill sizes="(max-width: 768px) 100vw, 65vw" />
            <span><Building2 /> Espacios culturales <small>Arte, historia y encuentros</small></span>
          </Link>
          <div className="place-stack">
            <Link href="/espacios-al-aire-libre"><Trees /><strong>Plazas y parques</strong><span>Disfrutá la ciudad al aire libre</span></Link>
            <a href={BUS_TURISTICO_URL}><Bus /><strong>Bus Turístico</strong><span>Conocé los circuitos de la ciudad</span></a>
          </div>
        </div>
      </section>
      <section className="app-banner">
        <div className="shell app-banner-inner">
          <div><p className="section-kicker">Ciudad SMT</p><h2>La ciudad, también en tu celular</h2><p>Accedé a servicios municipales y novedades desde la aplicación oficial.</p></div>
          <div className="app-actions">
            <a className="button button-light" href="https://play.google.com/store/apps/details?id=ar.gob.smt.ciudadana&hl=es_AR" rel="noreferrer">Google Play</a>
            <a className="button button-outline-light" href="https://apps.apple.com/ar/app/ciudad-smt/id6743326258" rel="noreferrer">App Store</a>
          </div>
        </div>
      </section>
    </>
  );
}
