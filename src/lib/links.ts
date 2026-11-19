// Sitios de la Municipalidad a los que la Agenda manda directo, sin página propia.
export const BUS_TURISTICO_URL = "https://busturistico.smt.gob.ar/";
/** Inscripción a los circuitos guiados del Bus Turístico (incluido el Museo a cielo abierto). */
export const BUS_INSCRIPCION_URL = "https://linktr.ee/busturisticosmt";
/** Mapa interactivo de la ciudad: espacios verdes, murales, servicios. */
export const MAPA_SMT_URL = "https://mapa.smt.gob.ar/";

export const APP_CIUDAD_SMT = {
  googlePlay: "https://play.google.com/store/apps/details?id=ar.gob.smt.ciudadana&hl=es_AR",
  appStore: "https://apps.apple.com/ar/app/ciudad-smt/id6743326258",
};

/** Redes oficiales de la Municipalidad, en el orden del pie del sitio anterior. */
export const REDES_MUNICIPIO = [
  { label: "Instagram", href: "https://www.instagram.com/munismtucuman/" },
  { label: "Facebook", href: "https://www.facebook.com/MuniSMTucuman" },
  { label: "X", href: "https://x.com/ciudadSMT" },
  { label: "TikTok", href: "https://www.tiktok.com/@ciudadsmt" },
  { label: "YouTube", href: "https://www.youtube.com/@ciudadSMT" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/munismtucuman/" },
];

/** Redes de la Dirección de Turismo. */
export const REDES_TURISMO = [
  { label: "Instagram", href: "https://www.instagram.com/turismosmt/" },
  { label: "Facebook", href: "https://www.facebook.com/turismosmt/" },
];

/** "Cómo llegar" en Google Maps a un punto exacto. */
export function mapsDirections(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
