import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getEventSlugs } from "@/services/events";
import { getPlaces } from "@/services/places";

export const revalidate = 3600;

const routes = [
  "", "/agenda", "/lugares", "/gastronomia", "/espacios-culturales", "/espacios-al-aire-libre", "/patrimonio-historico",
  "/ferias-municipales", "/pintamos-la-ciudad-que-queremos", "/museo-escultorico-a-cielo-abierto",
  "/planifica-tu-viaje", "/nuestra-ciudad", "/guias", "/oficinas", "/preguntas-frecuentes",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [eventSlugs, places] = await Promise.all([getEventSlugs(), getPlaces()]);
  return [
    ...routes.map((route) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}${route}`, lastModified: now, changeFrequency: route === "/agenda" ? "daily" as const : "weekly" as const, priority: route === "" ? 1 : .7 })),
    ...eventSlugs.map((slug) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/eventos/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: .8 })),
    ...places.map((place) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/lugares/${place.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: .6 })),
  ];
}
