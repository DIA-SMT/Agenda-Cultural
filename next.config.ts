import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
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
      { source: "/mapas-y-guias", destination: "/guias", permanent: true }
    ];
  },
};

export default nextConfig;
