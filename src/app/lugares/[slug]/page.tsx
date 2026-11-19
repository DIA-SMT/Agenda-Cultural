import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, ExternalLink, MapPin, Navigation, Phone, Ticket } from "lucide-react";
import { MapEmbed } from "@/components/content/map-embed";
import { EventGrid } from "@/components/events/event-grid";
import { getEvents } from "@/services/events";
import { PLACE_TYPE_LABELS } from "@/services/place-rows";
import { CULTURAL_PLACE_TYPES, getPlaceBySlug, OUTDOOR_PLACE_TYPES } from "@/services/places";

const SOCIAL_LABELS = { instagram: "Instagram", facebook: "Facebook" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return { title: "Lugar no encontrado" };
  return {
    title: place.name,
    description: place.summary,
    alternates: { canonical: `/lugares/${place.slug}` },
    openGraph: { title: place.name, description: place.summary, images: place.imageUrl ? [{ url: place.imageUrl }] : undefined },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  const events = await getEvents({ place: place.slug, pageSize: 3 });
  const back = CULTURAL_PLACE_TYPES.includes(place.type)
    ? { href: "/espacios-culturales", label: "Espacios culturales" }
    : OUTDOOR_PLACE_TYPES.includes(place.type)
      ? { href: "/espacios-al-aire-libre", label: "Espacios al aire libre" }
      : { href: "/lugares", label: "Lugares" };
  const paragraphs = (place.description ?? "").split(/\n{2,}/).filter(Boolean);
  const social = Object.entries(SOCIAL_LABELS).flatMap(([key, label]) => {
    const url = place.socialLinks?.[key as keyof typeof SOCIAL_LABELS];
    return url ? [{ label, url }] : [];
  });
  const hasCoordinates = place.latitude !== undefined && place.longitude !== undefined;
  // Con coordenadas, "Cómo llegar" y el mapa apuntan al punto exacto; si no, se busca por nombre y dirección.
  const mapsQuery = hasCoordinates
    ? `${place.latitude},${place.longitude}`
    : encodeURIComponent(`${place.name}, ${place.address}, San Miguel de Tucumán`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: place.name,
    description: place.summary,
    image: place.imageUrl,
    telephone: place.phone,
    address: { "@type": "PostalAddress", streetAddress: place.address, addressLocality: "San Miguel de Tucumán", addressRegion: "Tucumán", addressCountry: "AR" },
    sameAs: social.map((item) => item.url),
  };

  return (
    <div className="page-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="place-detail-hero">
        {place.imageUrl && <Image src={place.imageUrl} alt="" fill preload sizes="100vw" />}
        <div className="detail-overlay" />
        <div className="shell detail-heading">
          <Link href={back.href} className="back-link">
            <ArrowLeft size={18} /> {back.label}
          </Link>
          <p className="section-kicker">{PLACE_TYPE_LABELS[place.type].one}</p>
          <h1>{place.name}</h1>
          <p>{place.summary}</p>
        </div>
      </div>

      <div className="shell detail-layout">
        <div className="detail-main">
          {paragraphs.length > 0 && (
            <section><h2>Sobre el espacio</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
          )}
          {place.services && place.services.length > 0 && (
            <section><h2>{place.type === "park" ? "Qué vas a encontrar" : "Datos del espacio"}</h2><ul className="place-services">{place.services.map((item) => <li key={item}>{item}</li>)}</ul></section>
          )}
          {place.gallery && place.gallery.length > 0 && (
            <section>
              <h2>Galería</h2>
              <div className="place-gallery">
                {place.gallery.map((src, index) => (
                  <figure key={src}><Image src={src} alt={`${place.name}, foto ${index + 1} de ${place.gallery!.length}`} fill sizes="(max-width: 640px) 50vw, 280px" /></figure>
                ))}
              </div>
            </section>
          )}
          {hasCoordinates && (
            <section>
              <h2>Ubicación</h2>
              <MapEmbed latitude={place.latitude!} longitude={place.longitude!} title={place.name} />
            </section>
          )}
          {events.items.length > 0 && (
            <section><h2>Próximas actividades</h2><EventGrid events={events.items} /></section>
          )}
        </div>

        <aside className="event-facts" aria-label="Datos del lugar">
          {place.address && (
            <div><MapPin /><span><small>Dirección</small><strong>{place.address}</strong><em>San Miguel de Tucumán</em></span></div>
          )}
          {place.openingHours && place.openingHours.length > 0 && (
            <div><Clock3 /><span><small>Horarios</small>{place.openingHours.map((line) => <em key={line} className="place-hours">{line}</em>)}</span></div>
          )}
          {place.phone && (
            <div><Phone /><span><small>Teléfono</small><strong><a href={`tel:${place.phone.replace(/[^\d+]/g, "")}`}>{place.phone}</a></strong></span></div>
          )}
          {social.length > 0 && (
            <div><ExternalLink /><span><small>Redes</small>{social.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label}</a>)}</span></div>
          )}
          {(place.address || hasCoordinates) && (
            <a className="button button-primary" href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noreferrer"><Navigation size={18} /> Cómo llegar</a>
          )}
          {place.socialLinks?.entradas && (
            <a className="button button-secondary" href={place.socialLinks.entradas} target="_blank" rel="noreferrer"><Ticket size={18} /> Comprar entradas</a>
          )}
        </aside>
      </div>
    </div>
  );
}
