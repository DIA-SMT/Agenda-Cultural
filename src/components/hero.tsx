"use client";

import { ArrowRight, CalendarDays, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Category } from "@/types/domain";

const fixedLinks = [
  { label: "Hoy", query: "range=today" },
  { label: "Este fin de semana", query: "range=weekend" },
  { label: "Gratis", query: "free=1" },
];

type HeroProps = {
  todayLabel: string;
  hasOfficialData: boolean;
  /** Categorías con actividades por venir (la portada pasa las más concurridas). */
  categories: Pick<Category, "slug" | "name">[];
};

export function Hero({ todayLabel, hasOfficialData, categories }: HeroProps) {
  const quickLinks = [
    ...fixedLinks,
    ...categories.map((category) => ({ label: category.name, query: `category=${encodeURIComponent(category.slug)}` })),
  ];

  const sectionRef = useRef<HTMLElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    sectionRef.current?.style.setProperty("--hero-x", `${x}px`);
    sectionRef.current?.style.setProperty("--hero-y", `${y}px`);
  }

  return (
    <section ref={sectionRef} className="hero" onPointerMove={handlePointerMove} aria-labelledby="hero-title">
      <div className="hero-image" aria-hidden="true" />
      <div className="hero-wash" aria-hidden="true" />
      <div className="hero-petal petal-one" aria-hidden="true" />
      <div className="hero-petal petal-two" aria-hidden="true" />
      <div className="shell hero-content">
        <div className="hero-copy">
          <p className="eyebrow"><span /> La ciudad está pasando</p>
          <h1 id="hero-title">Viví la ciudad.<br /><em>Encontrá tu próximo plan.</em></h1>
          <p>Eventos, cultura, gastronomía y experiencias para disfrutar San Miguel de Tucumán.</p>
          <div className="hero-actions">
            <Link className="button button-accent" href="/agenda">Ver agenda <ArrowRight size={19} /></Link>
            <Link className="button button-ghost" href="/lugares">Explorar lugares <MapPin size={19} /></Link>
          </div>
        </div>
        <aside className="today-card" aria-label="Hoy en San Miguel de Tucumán">
          <span className="today-label"><CalendarDays size={18} /> Hoy en SMT</span>
          <strong>{todayLabel}</strong>
          <p>{hasOfficialData ? "Mirá las actividades programadas para hoy en la ciudad." : "Los próximos eventos oficiales aparecerán aquí al conectar la base de datos."}</p>
          <Link href="/agenda?range=today">Ver qué hay hoy <ArrowRight size={17} /></Link>
        </aside>
        <form className="hero-search" action="/agenda" role="search">
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="hero-query">Buscar eventos, lugares o actividades</label>
          <input id="hero-query" name="q" type="search" placeholder="Buscar eventos, lugares o actividades…" />
          <button type="submit">Buscar</button>
        </form>
        <nav className="quick-links" aria-label="Búsquedas rápidas">
          {quickLinks.map((item) => <Link key={item.label} href={`/agenda?${item.query}`}>{item.label}</Link>)}
        </nav>
      </div>
    </section>
  );
}
