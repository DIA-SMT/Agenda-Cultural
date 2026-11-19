/**
 * Lo que lee Migue, el asistente de la Municipalidad, para atender el chat de la Agenda
 * Cultural (GET /api/migue/contenido).
 *
 * Es el mismo contenido que se ve en el sitio, pasado a texto: una ficha por evento y por
 * lugar con su dirección dentro del sitio, y un bloque general. Es el mismo formato que usa
 * el sitio de turismo, así Migue los lee igual. Migue no conoce el esquema de la base: lee
 * este texto, contesta con él y sólo puede ofrecer botones hacia las direcciones que figuran acá.
 *
 * Sólo va lo publicado y lo que todavía no pasó: Migue no anuncia un evento que el equipo no
 * confirmó ni uno que ya terminó.
 */

import { PLACE_TYPE_LABELS } from "@/services/place-rows";
import type { CulturalEvent, EventOccurrence, Place } from "@/types/domain";

export type FichaMigue = { tipo: string; titulo: string; url: string; texto: string };

export type ContenidoMigue = {
  version: 1;
  generado: string;
  general: string;
  fichas: FichaMigue[];
};

/** Páginas del sitio con contenido propio, que Migue también puede ofrecer como botón. */
export const PAGINAS_GENERALES: FichaMigue[] = [
  { tipo: "página", titulo: "Agenda", url: "/agenda", texto: "Todos los eventos por venir, con filtros por fecha (hoy, fin de semana o una fecha), categoría, lugar y si son gratis." },
  { tipo: "página", titulo: "Lugares para descubrir", url: "/lugares", texto: "Museos, teatros, centros culturales y espacios de la ciudad, con dirección y horarios." },
  { tipo: "página", titulo: "Espacios culturales", url: "/espacios-culturales", texto: "Museos, teatros, centros y casas culturales: horarios, direcciones y qué ver en cada uno." },
];

// Cuántas fechas de un mismo evento se le pasan: alcanza para responder "¿cuándo es?"
// sin que un ciclo con funciones todos los días llene el contexto.
const MAX_FECHAS = 6;
// Los eventos de más adelante no ayudan a contestar y engordan el texto.
const DIAS_ADELANTE = 120;
const MAX_DESCRIPCION = 700;

const ZONA = "America/Argentina/Tucuman";
const fecha = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: ZONA });
const hora = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA });

const ESTADO: Record<EventOccurrence["status"], string> = {
  scheduled: "",
  suspended: "SUSPENDIDA",
  rescheduled: "reprogramada",
  cancelled: "CANCELADA",
};
const ACCESO: Record<CulturalEvent["accessType"], string> = { free: "Gratis", paid: "Pago", check: "Consultar" };

const limpio = (t: unknown) => String(t ?? "").replace(/\s+/g, " ").trim();
const recortado = (t: unknown, max: number) => {
  const s = limpio(t);
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "")}…` : s;
};
const linea = (etiqueta: string, valor: unknown) => (limpio(valor) ? `${etiqueta}: ${limpio(valor)}` : "");
const unir = (lineas: string[]) => lineas.filter(Boolean).join("\n");

/** "jueves 20 de noviembre de 2026, 21:00 a 23:00 h" en hora de Tucumán. */
export function formatearFecha(o: EventOccurrence): string {
  const dia = fecha.format(new Date(o.startsAt));
  const estado = ESTADO[o.status] ? ` (${ESTADO[o.status]})` : "";
  if (o.allDay) return `${dia}, todo el día${estado}`;
  const fin = o.endsAt ? ` a ${hora.format(new Date(o.endsAt))}` : "";
  return `${dia}, ${hora.format(new Date(o.startsAt))}${fin} h${estado}`;
}

const precio = (e: CulturalEvent) => [ACCESO[e.accessType], limpio(e.price)].filter(Boolean).join(" — ");

function fichaEvento(e: CulturalEvent, desde: number, hasta: number): FichaMigue | null {
  const fechas = e.occurrences
    .filter((o) => Date.parse(o.endsAt ?? o.startsAt) >= desde && Date.parse(o.startsAt) <= hasta)
    .slice(0, MAX_FECHAS)
    .map(formatearFecha);
  if (!fechas.length) return null;
  const lugar = e.place?.name ? [limpio(e.place.name), limpio(e.place.address)].filter(Boolean).join(", ") : "";
  return {
    tipo: "evento",
    titulo: limpio(e.title),
    url: `/eventos/${e.slug}`,
    texto: unir([
      limpio(e.summary),
      linea("Próximas fechas", fechas.join("; ")),
      linea("Dónde", lugar),
      linea("Categorías", e.categories.map((c) => limpio(c.name)).join(", ")),
      linea("Entrada", precio(e)),
      linea("Entradas", e.ticketUrl),
      linea("Inscripción", e.registrationUrl),
      linea("Organiza", e.organizer),
      linea("Contacto", e.contact),
      linea("Accesibilidad", e.accessibility),
      linea("Descripción", recortado(e.description, MAX_DESCRIPCION)),
    ]),
  };
}

function fichaLugar(l: Place): FichaMigue {
  const redes = l.socialLinks
    ? [linea("Instagram", l.socialLinks.instagram), linea("Facebook", l.socialLinks.facebook), linea("Entradas", l.socialLinks.entradas)]
    : [];
  return {
    tipo: (PLACE_TYPE_LABELS[l.type] ?? PLACE_TYPE_LABELS.other).one.toLowerCase(),
    titulo: limpio(l.name),
    url: `/lugares/${l.slug}`,
    texto: unir([
      limpio(l.summary),
      linea("Dirección", l.address),
      // Una línea que termina en ":" es un título ("Horarios de verano:"): va pegada a la siguiente.
      linea("Horarios", (l.openingHours ?? []).map(limpio).join("; ").replace(/:; /g, ": ")),
      linea("Teléfono", l.phone),
      linea("Correo", l.email),
      linea("Web", l.website),
      ...redes,
      linea("Servicios", (l.services ?? []).map(limpio).join(", ")),
      linea("Accesibilidad", l.accessibility),
      linea("Descripción", recortado(l.description, MAX_DESCRIPCION)),
    ]),
  };
}

/** El contenido visible del sitio, en texto para Migue. Función pura: se prueba sin base. */
export function paraMigue(eventos: CulturalEvent[], lugares: Place[], ahora = Date.now()): ContenidoMigue {
  const hasta = ahora + DIAS_ADELANTE * 24 * 3600 * 1000;
  // Los eventos de demostración (sitio sin base) no son información oficial: Migue no los anuncia.
  const fichasEventos = eventos
    .filter((e) => !e.isDemo && (e.status === "published" || e.status === "rescheduled"))
    .map((e) => fichaEvento(e, ahora, hasta))
    .filter((f): f is FichaMigue => f !== null);
  const fichasLugares = lugares.filter((l) => l.status === "published").map(fichaLugar);

  const categorias = [...new Set(eventos.filter((e) => !e.isDemo).flatMap((e) => e.categories.map((c) => limpio(c.name))))].sort((a, b) => a.localeCompare(b, "es-AR"));
  const general = unir([
    "Agenda Cultural de la Municipalidad de San Miguel de Tucumán: eventos, cultura y experiencias para disfrutar la ciudad.",
    fichasEventos.length
      ? `Eventos por venir publicados: ${fichasEventos.length}. Lugares publicados: ${fichasLugares.length}.`
      : `Por ahora no hay eventos por venir publicados en la agenda. Lugares publicados: ${fichasLugares.length}.`,
    linea("Categorías de eventos", categorias.join(", ")),
  ]);

  return {
    version: 1,
    generado: new Date(ahora).toISOString(),
    general,
    fichas: [...fichasEventos, ...fichasLugares, ...PAGINAS_GENERALES],
  };
}
