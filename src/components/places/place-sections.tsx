import { MapPinned } from "lucide-react";
import { PlaceCard } from "@/components/places/place-card";
import type { Place } from "@/types/domain";

interface PlaceGroup { type: Place["type"]; label: string; places: Place[] }

export function PlaceSections({ groups }: { groups: PlaceGroup[] }) {
  if (!groups.length) {
    return (
      <div className="shell section">
        <div className="empty-state"><MapPinned size={34} /><h2>Todavía no hay lugares publicados</h2><p>Cuando se carguen desde el panel van a aparecer acá.</p></div>
      </div>
    );
  }

  return (
    <div className="shell place-sections">
      {groups.map((group) => (
        <section key={group.type} aria-labelledby={`lugares-${group.type}`}>
          <div className="section-heading">
            <div>
              <p className="section-kicker">{group.places.length} {group.places.length === 1 ? "lugar" : "lugares"}</p>
              <h2 id={`lugares-${group.type}`}>{group.label}</h2>
            </div>
          </div>
          <div className="event-grid">
            {group.places.map((place) => <PlaceCard key={place.id} place={place} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
