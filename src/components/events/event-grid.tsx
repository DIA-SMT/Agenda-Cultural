import { CalendarX } from "lucide-react";
import type { CulturalEvent } from "@/types/domain";
import { EventCard } from "./event-card";

export function EventGrid({ events }: { events: CulturalEvent[] }) {
  if (!events.length) {
    return (
      <div className="empty-state" role="status">
        <CalendarX size={36} aria-hidden="true" />
        <h2>No encontramos actividades con esos filtros</h2>
        <p>Probá ampliar las fechas o limpiar alguna opción.</p>
      </div>
    );
  }

  return <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>;
}
