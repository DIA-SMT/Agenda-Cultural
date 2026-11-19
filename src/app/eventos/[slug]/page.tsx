import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Clock3, ExternalLink, MapPin, Navigation, Ticket } from "lucide-react";
import { ShareActions } from "@/components/events/share-actions";
import { accessLabel, formatCalendarDate, formatEventDate, formatEventTime } from "@/lib/format";
import { getEventBySlug } from "@/services/events";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado" };
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/eventos/${event.slug}` },
    openGraph: { title: event.title, description: event.summary, type: "article", images: [{ url: event.imageUrl }] },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const occurrence = event.occurrences[0];
  const calendarQuery = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${formatCalendarDate(occurrence.startsAt)}/${formatCalendarDate(occurrence.endsAt || occurrence.startsAt)}`, details: event.summary, location: `${event.place.name}, ${event.place.address}` });
  const jsonLd = { "@context": "https://schema.org", "@type": "Event", name: event.title, description: event.summary, startDate: occurrence.startsAt, endDate: occurrence.endsAt, eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", location: { "@type": "Place", name: event.place.name, address: event.place.address }, offers: { "@type": "Offer", price: event.accessType === "free" ? 0 : undefined, priceCurrency: "ARS", availability: "https://schema.org/InStock" } };

  return (
    <article className="event-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="detail-hero">
        <Image src={event.imageUrl} alt="" fill preload sizes="100vw" />
        <div className="detail-overlay" />
        <div className="shell detail-heading">
          <nav aria-label="Migas de pan"><Link href="/">Inicio</Link><span>/</span><Link href="/agenda">Agenda</Link></nav>
          <div className="category-row light-tags">{event.categories.map((category) => <span key={category.id}>{category.name}</span>)}</div>
          <h1>{event.title}</h1>
          <p>{event.summary}</p>
        </div>
      </div>
      <div className="shell detail-layout">
        <div className="detail-main">
          {event.isDemo && <div className="demo-notice">Contenido demostrativo: será reemplazado por información oficial.</div>}
          <section><h2>Sobre la actividad</h2>{event.description.split(/\n{2,}/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
          {event.occurrences.length > 1 && <section><h2>Próximas fechas</h2><ul className="occurrence-list">{event.occurrences.map((item) => <li key={item.id}><CalendarPlus /><span><strong>{formatEventDate(item.startsAt)}</strong>{formatEventTime(item.startsAt)}</span></li>)}</ul></section>}
          <section><h2>Compartí este evento</h2><ShareActions title={event.title} /></section>
        </div>
        <aside className="event-facts" aria-label="Datos del evento">
          <div><CalendarPlus /><span><small>Fecha</small><strong>{formatEventDate(occurrence.startsAt)}</strong></span></div>
          <div><Clock3 /><span><small>Hora</small><strong>{formatEventTime(occurrence.startsAt)}</strong></span></div>
          <div><MapPin /><span><small>Lugar</small><strong>{event.place.slug ? <Link href={`/lugares/${event.place.slug}`}>{event.place.name}</Link> : event.place.name}</strong><em>{event.place.address}</em></span></div>
          <div><Ticket /><span><small>Entrada</small><strong>{accessLabel(event.accessType, event.price)}</strong></span></div>
          <a className="button button-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.place.address)}`} target="_blank" rel="noreferrer"><Navigation size={18} /> Cómo llegar</a>
          <a className="button button-secondary" href={`https://calendar.google.com/calendar/render?${calendarQuery}`} target="_blank" rel="noreferrer"><CalendarPlus size={18} /> Google Calendar</a>
          <a className="button button-secondary" href={`/api/events/${event.slug}/ics`}><ExternalLink size={18} /> Descargar .ics</a>
        </aside>
      </div>
    </article>
  );
}
