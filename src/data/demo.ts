import type { Category, CulturalEvent, Place } from "@/types/domain";

export const demoCategories: Category[] = [
  { id: "cat-musica", name: "Música", slug: "musica", color: "#0274BE" },
  { id: "cat-teatro", name: "Teatro", slug: "teatro", color: "#6046A8" },
  { id: "cat-taller", name: "Talleres", slug: "talleres", color: "#B96A12" },
  { id: "cat-familia", name: "Para toda la familia", slug: "familia", color: "#087B6D" },
];

export const demoPlaces: Place[] = [
  {
    id: "place-cultura",
    name: "Espacio cultural de demostración",
    slug: "espacio-cultural-demo",
    type: "cultural_house",
    summary: "Ficha de ejemplo preparada para conectarse con el catálogo municipal.",
    address: "Ubicación pendiente de importar",
    imageUrl: "/images/hero-cultura-smt.jpg",
    featured: true,
    status: "published",
  },
  {
    id: "place-aire-libre",
    name: "Punto de encuentro de demostración",
    slug: "punto-encuentro-demo",
    type: "square",
    summary: "Contenido de desarrollo, no constituye información oficial.",
    address: "Ubicación pendiente de importar",
    imageUrl: "/images/circuito-smt.jpg",
    featured: false,
    status: "published",
  },
];

export const demoEvents: CulturalEvent[] = [
  {
    id: "evt-demo-musica",
    title: "Encuentro musical · Demostración",
    slug: "encuentro-musical-demo",
    summary: "Evento de prueba para validar la agenda, sus filtros y el detalle.",
    description: "Este contenido está identificado como demostración. Será reemplazado por información oficial durante la importación desde el sistema anterior.",
    imageUrl: "/images/hero-cultura-smt.jpg",
    place: demoPlaces[0],
    categories: [demoCategories[0], demoCategories[3]],
    occurrences: [
      { id: "occ-1", eventId: "evt-demo-musica", startsAt: "2026-09-18T20:00:00-03:00", endsAt: "2026-09-18T22:00:00-03:00", allDay: false, timezone: "America/Argentina/Tucuman", status: "scheduled" },
    ],
    organizer: "Dato pendiente de importación",
    accessType: "free",
    accessibility: "Información pendiente de importación",
    featured: true,
    status: "published",
    isDemo: true,
  },
  {
    id: "evt-demo-teatro",
    title: "Función de teatro · Demostración",
    slug: "funcion-teatro-demo",
    summary: "Ejemplo de evento con inscripción externa preparada.",
    description: "Contenido de desarrollo para comprobar la experiencia de una ficha de evento y las acciones de difusión.",
    imageUrl: "/images/circuito-smt.jpg",
    place: demoPlaces[1],
    categories: [demoCategories[1]],
    occurrences: [
      { id: "occ-2", eventId: "evt-demo-teatro", startsAt: "2026-09-19T19:30:00-03:00", endsAt: "2026-09-19T21:00:00-03:00", allDay: false, timezone: "America/Argentina/Tucuman", status: "scheduled" },
    ],
    accessType: "check",
    featured: false,
    status: "published",
    isDemo: true,
  },
  {
    id: "evt-demo-taller",
    title: "Taller creativo · Demostración",
    slug: "taller-creativo-demo",
    summary: "Ejemplo recurrente para probar múltiples fechas.",
    description: "La serie demuestra cómo se visualizarán las recurrencias y sus próximas fechas sin presentar información ficticia como oficial.",
    imageUrl: "/images/hero-cultura-smt.jpg",
    place: demoPlaces[0],
    categories: [demoCategories[2]],
    occurrences: [
      { id: "occ-3", eventId: "evt-demo-taller", startsAt: "2026-09-20T16:00:00-03:00", endsAt: "2026-09-20T18:00:00-03:00", allDay: false, timezone: "America/Argentina/Tucuman", status: "scheduled" },
      { id: "occ-4", eventId: "evt-demo-taller", startsAt: "2026-09-27T16:00:00-03:00", endsAt: "2026-09-27T18:00:00-03:00", allDay: false, timezone: "America/Argentina/Tucuman", status: "scheduled" },
    ],
    accessType: "paid",
    price: "Precio pendiente de importar",
    featured: false,
    status: "published",
    isDemo: true,
  },
];
