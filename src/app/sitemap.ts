import type { MetadataRoute } from "next";
import { demoEvents, demoPlaces } from "@/data/demo";
import { env } from "@/lib/env";

const routes = ["", "/agenda", "/lugares", "/bus-turistico", "/gastronomia", "/espacios-culturales", "/espacios-al-aire-libre", "/patrimonio-historico", "/planifica-tu-viaje", "/nuestra-ciudad", "/guias", "/oficinas", "/preguntas-frecuentes"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...routes.map((route) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}${route}`, lastModified: now, changeFrequency: route === "/agenda" ? "daily" as const : "weekly" as const, priority: route === "" ? 1 : .7 })),
    ...demoEvents.map((event) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/eventos/${event.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: .8 })),
    ...demoPlaces.map((place) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/lugares/${place.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: .6 })),
  ];
}
