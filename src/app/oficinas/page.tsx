import type { Metadata } from "next";
import { Clock3, ExternalLink, MapPin, Navigation, Phone } from "lucide-react";
import { ContentHero } from "@/components/content/content-hero";
import { MapEmbed } from "@/components/content/map-embed";
import { mapsDirections, REDES_MUNICIPIO, REDES_TURISMO } from "@/lib/links";

export const metadata: Metadata = {
  title: "Oficinas",
  description: "Oficina de Turismo y sede de la Municipalidad de San Miguel de Tucumán: direcciones, horarios y contacto.",
  alternates: { canonical: "/oficinas" },
};

const oficinas = [
  {
    name: "Oficina de Turismo SMT",
    text: "Información turística, mapas, folletos y asesoramiento para recorrer la ciudad.",
    address: "Peatonal Congreso 121",
    hours: ["Lunes a viernes: 8 a 13 h y 16 a 21 h", "Sábados, domingos y feriados: 9 a 20 h (corrido)"],
    latitude: -26.833019,
    longitude: -65.203692,
    redes: REDES_TURISMO,
  },
  {
    name: "Municipalidad de San Miguel de Tucumán",
    text: "Sede central: atención a vecinos, trámites y servicios municipales.",
    address: "9 de Julio 570",
    hours: ["Lunes a viernes: 8 a 20 h"],
    phone: "(0381) 451-6500",
    latitude: -26.838846,
    longitude: -65.206642,
    redes: REDES_MUNICIPIO.filter((red) => red.label === "Instagram" || red.label === "Facebook"),
  },
];

export default function OfficesPage() {
  return (
    <div className="page-surface">
      <ContentHero
        kicker="Info útil"
        title="Oficinas"
        intro="Dónde pedir información, asistencia y servicios en la ciudad, para vecinos y visitantes."
      />
      <div className="shell office-list">
        {oficinas.map((oficina) => (
          <section key={oficina.name} className="office-card" aria-labelledby={`oficina-${oficina.latitude}`}>
            <div className="office-info">
              <h2 id={`oficina-${oficina.latitude}`}>{oficina.name}</h2>
              <p>{oficina.text}</p>
              <div className="event-facts office-facts">
                <div><MapPin /><span><small>Dirección</small><strong>{oficina.address}</strong><em>San Miguel de Tucumán</em></span></div>
                <div><Clock3 /><span><small>Horarios</small>{oficina.hours.map((line) => <em key={line} className="place-hours">{line}</em>)}</span></div>
                {oficina.phone && (
                  <div><Phone /><span><small>Teléfono</small><strong><a href={`tel:+54${oficina.phone.replace(/\D/g, "").replace(/^0/, "")}`}>{oficina.phone}</a></strong></span></div>
                )}
                <div><ExternalLink /><span><small>Redes</small>{oficina.redes.map((red) => <a key={red.href} href={red.href} target="_blank" rel="noreferrer">{red.label}</a>)}</span></div>
                <a className="button button-primary" href={mapsDirections(oficina.latitude, oficina.longitude)} target="_blank" rel="noreferrer"><Navigation size={18} /> Cómo llegar</a>
              </div>
            </div>
            <MapEmbed latitude={oficina.latitude} longitude={oficina.longitude} title={oficina.name} />
          </section>
        ))}
      </div>
    </div>
  );
}
