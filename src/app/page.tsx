import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BedDouble, Building2, Bus, Car, Trees, UtensilsCrossed } from "lucide-react";
import { WeekStrip } from "@/components/agenda/week-strip";
import { ContentCard } from "@/components/content/content-card";
import { DemoNotice } from "@/components/demo-notice";
import { EventGrid } from "@/components/events/event-grid";
import { Hero } from "@/components/hero";
import { categoryEmoji } from "@/lib/category-emoji";
import { addDays, todayInTucuman } from "@/lib/dates";
import { isDatabaseConfigured } from "@/lib/db";
import { APP_CIUDAD_SMT, BUS_TURISTICO_URL } from "@/lib/links";
import { formatLongDate } from "@/lib/format";
import { getCalendarDays, getEvents, getPopularCategories } from "@/services/events";

// La portada se prerenderiza; se regenera cada 5 minutos para reflejar la agenda y la fecha del día.
export const revalidate = 300;

export default async function HomePage() {
  const today = todayInTucuman();
  const [events, categories, week] = await Promise.all([
    getEvents({ pageSize: 3 }),
    getPopularCategories(4),
    getCalendarDays({}, today, addDays(today, 6)),
  ]);

  return (
    <>
      <Hero todayLabel={formatLongDate(new Date())} hasOfficialData={isDatabaseConfigured} />
      <div className="shell"><DemoNotice /></div>
      <section className="section shell" aria-labelledby="next-events">
        <div className="section-heading">
          <div><p className="section-kicker">Agenda</p><h2 id="next-events">Próximos eventos</h2></div>
          <Link href="/agenda">Ver agenda completa <ArrowRight size={18} /></Link>
        </div>
        <EventGrid events={events.items} />
        <WeekStrip today={today} days={week.days} />
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
            <Link href="/espacios-al-aire-libre">
              <Image src="/images/contenido/aire-libre/parques.webp" alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, 35vw" />
              <Trees /><strong>Plazas y parques</strong><span>Disfrutá la ciudad al aire libre</span>
            </Link>
            <a href={BUS_TURISTICO_URL}>
              <Image src="/images/contenido/planifica/excursiones.webp" alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, 35vw" />
              <Bus /><strong>Bus Turístico</strong><span>Conocé los circuitos de la ciudad</span>
            </a>
          </div>
        </div>
      </section>
      <section className="section shell home-musts" aria-labelledby="musts-title">
        <div className="section-heading">
          <div><p className="section-kicker">No te los pierdas</p><h2 id="musts-title">Imperdibles de la ciudad</h2></div>
          <Link href="/espacios-al-aire-libre">Más al aire libre <ArrowRight size={18} /></Link>
        </div>
        <div className="event-grid">
          <ContentCard
            title="Ferias municipales"
            text="Puntos de encuentro de artesanos, gastronomía y emprendimientos locales, ideales para recorrer y descubrir la identidad de la ciudad."
            image="/images/contenido/ferias/portada.webp"
            badge="Ferias"
            href="/ferias-municipales"
          />
          <ContentCard
            title="Pintamos la ciudad que queremos"
            text="El muralismo local transforma la ciudad en un paseo artístico donde los vecinos comparten su expresión."
            image="/images/contenido/murales/mural-04.webp"
            badge="Murales"
            href="/pintamos-la-ciudad-que-queremos"
          />
          <ContentCard
            title="Museo a cielo abierto"
            text="Un recorrido guiado por las esculturas del Parque 9 de Julio que pone en valor su patrimonio cultural y paisajístico."
            image="/images/contenido/museo-a-cielo-abierto/portada.webp"
            badge="Recorrido guiado"
            href="/museo-escultorico-a-cielo-abierto"
          />
        </div>
      </section>
      <section className="shell visit-strip" aria-labelledby="visit-title">
        <h2 id="visit-title" className="sr-only">Organizá tu visita</h2>
        <Link href="/planifica-tu-viaje"><BedDouble aria-hidden="true" /><span><strong>Alojamiento</strong>Hoteles, hostels y departamentos</span><ArrowRight size={18} aria-hidden="true" /></Link>
        <Link href="/gastronomia"><UtensilsCrossed aria-hidden="true" /><span><strong>Gastronomía</strong>Sabores típicos, bares y peñas</span><ArrowRight size={18} aria-hidden="true" /></Link>
        <Link href="/planifica-tu-viaje"><Car aria-hidden="true" /><span><strong>Agencias y autos</strong>Excursiones y alquiler de autos</span><ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
      <section className="app-banner">
        <div className="shell app-banner-inner">
          <div className="app-phones">
            <Image src="/images/contenido/app/ciudad-smt-celulares.webp" alt="La app Ciudad SMT abierta en dos iPhone" width={584} height={763} sizes="(max-width: 640px) 220px, (max-width: 900px) 240px, 300px" />
          </div>
          <div><p className="section-kicker">Ciudad SMT</p><h2>La ciudad, también en tu celular</h2><p>Accedé a servicios municipales y novedades desde la aplicación oficial.</p></div>
          <div className="app-actions">
            <a className="button button-light" href={APP_CIUDAD_SMT.googlePlay} rel="noreferrer">Google Play</a>
            <a className="button button-outline-light" href={APP_CIUDAD_SMT.appStore} rel="noreferrer">App Store</a>
          </div>
        </div>
      </section>
    </>
  );
}
