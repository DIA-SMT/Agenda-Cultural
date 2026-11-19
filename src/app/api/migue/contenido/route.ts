import { NextResponse } from "next/server";
import { paraMigue } from "@/lib/migue";
import { getAllUpcomingEvents } from "@/services/events";
import { getPlaces } from "@/services/places";

/**
 * GET /api/migue/contenido — el contenido publicado de la Agenda, en texto, para Migue (el
 * asistente de la Municipalidad que atiende el chat del sitio). Ver src/lib/migue.ts.
 *
 * Es público como el sitio: no trae nada que no esté ya a la vista, ni borradores. Migue lo
 * guarda unos minutos y acá se cachea otros cinco, así cada mensaje del chat no consulta la base.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const [eventos, lugares] = await Promise.all([getAllUpcomingEvents(), getPlaces()]);
  return NextResponse.json(paraMigue(eventos, lugares), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Robots-Tag": "noindex",
    },
  });
}
