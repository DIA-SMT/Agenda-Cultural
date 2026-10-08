import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { demoPlaces } from "@/data/demo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const place = demoPlaces.find((item) => item.slug === slug);
  return place ? { title: place.name, description: place.summary, alternates: { canonical: `/lugares/${place.slug}` } } : { title: "Lugar no encontrado" };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = demoPlaces.find((item) => item.slug === slug);
  if (!place) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Place", name: place.name, description: place.summary, address: place.address };
  return (
    <div className="page-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="place-detail-hero">{place.imageUrl && <Image src={place.imageUrl} alt="" fill priority sizes="100vw" />}<div className="detail-overlay" /><div className="shell detail-heading"><Link href="/lugares" className="back-link"><ArrowLeft size={18} /> Volver a lugares</Link><p className="section-kicker">Contenido demostrativo</p><h1>{place.name}</h1><p>{place.summary}</p></div></div>
      <div className="shell section"><div className="content-pending"><MapPin /><h2>Información del lugar</h2><p>{place.address}</p><p>Horarios, contacto, accesibilidad, servicios y próximos eventos se incorporarán desde la fuente oficial.</p></div></div>
    </div>
  );
}
