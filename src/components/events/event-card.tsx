import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { accessLabel, formatEventDate, formatEventTime } from "@/lib/format";
import type { CulturalEvent } from "@/types/domain";

export function EventCard({ event }: { event: CulturalEvent }) {
  const occurrence = event.occurrences[0];

  return (
    <article className="event-card">
      <Link className="card-link" href={`/eventos/${event.slug}`} aria-label={`Ver evento: ${event.title}`}>
        <span className="sr-only">Ver evento</span>
      </Link>
      <div className="event-image">
        <Image src={event.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" />
        <span className="access-badge">{accessLabel(event.accessType, event.price)}</span>
        {event.featured && <span className="featured-badge">Destacado</span>}
      </div>
      <div className="event-body">
        <div className="event-meta">
          <strong>{formatEventDate(occurrence.startsAt)}</strong>
          <span><Clock3 size={15} /> {formatEventTime(occurrence.startsAt)}</span>
        </div>
        <div className="category-row">
          {event.categories.map((category) => <span key={category.id}>{category.name}</span>)}
        </div>
        <h3>{event.title}</h3>
        <p className="event-place"><MapPin size={17} /> <span>{event.place.name}<small>{event.place.address}</small></span></p>
        <span className="event-cta">Ver evento <ArrowUpRight size={18} /></span>
      </div>
    </article>
  );
}
