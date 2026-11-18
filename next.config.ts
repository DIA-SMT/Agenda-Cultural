import type { NextConfig } from "next";
import contenido from "./db/contenido/espacios-culturales.json";

// En el sitio anterior cada espacio colgaba de la raíz (/casa-historica/); acá vive en /lugares/<slug>.
const legacyPlaceRedirects = contenido.espacios.map(({ slug }) => ({
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
      { source: "/bus-turistico-smt", destination: "/bus-turistico", permanent: true },
      { source: "/faqs", destination: "/preguntas-frecuentes", permanent: true },
      { source: "/mapas-y-guias", destination: "/guias", permanent: true },
      ...legacyPlaceRedirects,
      // Los eventos del sitio anterior colgaban de /www.agendaculturalsmt.com/events/<slug>/ (un error de
      // configuración de WordPress) o de /events/<slug>/. El importador conserva el slug.
      { source: "/www.agendaculturalsmt.com/events/:slug", destination: "/eventos/:slug", permanent: true },
      { source: "/events/:slug", destination: "/eventos/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
