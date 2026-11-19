import type { NextConfig } from "next";
import aireLibre from "./db/contenido/espacios-al-aire-libre.json";
import contenido from "./db/contenido/espacios-culturales.json";
import { BUS_TURISTICO_URL } from "./src/lib/links";

// En el sitio anterior cada espacio colgaba de la raíz (/casa-historica/, /parque-avellaneda/); acá vive en
// /lugares/<slug>. Las plazas no tenían página propia, pero la redirección no molesta.
const legacyPlaceRedirects = [...contenido.espacios, ...aireLibre.espacios].map(({ slug }) => ({
  source: `/${slug}`,
  destination: `/lugares/${slug}`,
  permanent: true,
}));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    // Fotos del panel: hasta 10 MB cada una, varias por guardado en la galería. nginx tiene que aceptar lo mismo.
    serverActions: { bodySizeLimit: "32mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "agendaculturalsmt.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/que-hacer", destination: "/agenda", permanent: true },
      { source: "/que-hacer/", destination: "/agenda", permanent: true },
      // El Bus Turístico tiene su propio sitio municipal: la Agenda no le hace página y manda directo ahí.
      // Temporal (307) para poder volver atrás sin que los navegadores se queden con la redirección guardada.
      { source: "/bus-turistico", destination: BUS_TURISTICO_URL, permanent: false },
      { source: "/bus-turistico-smt", destination: BUS_TURISTICO_URL, permanent: false },
      { source: "/faqs", destination: "/preguntas-frecuentes", permanent: true },
      { source: "/mapas-y-guias", destination: "/guias", permanent: true },
      { source: "/donde-y-que-comer", destination: "/gastronomia", permanent: true },
      { source: "/plazas-y-parques", destination: "/espacios-al-aire-libre", permanent: true },
      { source: "/plazas", destination: "/espacios-al-aire-libre", permanent: true },
      { source: "/parques", destination: "/espacios-al-aire-libre", permanent: true },
      ...legacyPlaceRedirects,
      // Los eventos del sitio anterior colgaban de /www.agendaculturalsmt.com/events/<slug>/ (un error de
      // configuración de WordPress) o de /events/<slug>/. El importador conserva el slug.
      { source: "/www.agendaculturalsmt.com/events/:slug", destination: "/eventos/:slug", permanent: true },
      { source: "/events/:slug", destination: "/eventos/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
