import { getEventBySlug } from "@/services/events";

function icsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return new Response("Evento no encontrado", { status: 404 });
  const occurrence = event.occurrences[0];
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Agenda Cultural SMT//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${occurrence.id}@agendaculturalsmt`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(occurrence.startsAt)}`, `DTEND:${icsDate(occurrence.endsAt || occurrence.startsAt)}`, `SUMMARY:${escapeIcs(event.title)}`, `DESCRIPTION:${escapeIcs(event.summary)}`, `LOCATION:${escapeIcs(`${event.place.name}, ${event.place.address}`)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return new Response(content, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${event.slug}.ics"` } });
}
