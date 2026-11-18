import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PLACE_TYPE_LABELS } from "@/services/place-rows";
import type { Place } from "@/types/domain";

export function PlaceCard({ place }: { place: Place }) {
  return (
    <article className="event-card">
      <Link className="card-link" href={`/lugares/${place.slug}`} aria-label={`Conocé ${place.name}`}>
        <span className="sr-only">Conocé el espacio</span>
      </Link>
      <div className="event-image place-image">
        {place.imageUrl && <Image src={place.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw" />}
        <span className="access-badge">{PLACE_TYPE_LABELS[place.type].one}</span>
      </div>
      <div className="event-body">
        <h3>{place.name}</h3>
        <p className="place-summary">{place.summary}</p>
        {place.address && <p className="event-place"><MapPin size={17} /> <span>{place.address}</span></p>}
        <span className="event-cta">Conocé el espacio <ArrowUpRight size={18} /></span>
      </div>
    </article>
  );
}
