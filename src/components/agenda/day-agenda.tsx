import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarX, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { dayLabel, shortDay } from "@/lib/calendar";
import { categoryEmoji } from "@/lib/category-emoji";
import { tucumanDate } from "@/lib/dates";
import { accessLabel, formatClock } from "@/lib/format";
import type { DayEntry } from "@/services/events";

interface DayLink { day: string; href: string }

interface DayAgendaProps {
  day: string;
  today: string;
  entries: DayEntry[];
  /** Los días con actividades de antes y de después en el mes: se recorre la agenda sin volver al calendario. */
  previous?: DayLink;
  next?: DayLink;
}

export function DayAgenda({ day, today, entries, previous, next }: DayAgendaProps) {
  const timed = entries.filter((entry) => !entry.allDay);
  const allDay = entries.filter((entry) => entry.allDay);

  return (
    <section className="day-agenda" id="dia" aria-labelledby="day-title">
      <header className="day-agenda-head">
        <div>
          <p className="section-kicker">{day === today ? "Hoy" : "Qué hay el"}</p>
          <h3 id="day-title">{dayLabel(day)}</h3>
        </div>
        <div className="day-agenda-side">
          {entries.length > 0 && <span className="day-agenda-count">{entries.length} {entries.length === 1 ? "actividad" : "actividades"}</span>}
          <nav className="day-agenda-nav" aria-label="Otros días">
            {previous
              ? <Link href={previous.href} aria-label={`Día anterior: ${dayLabel(previous.day)}`}><ChevronLeft size={19} /></Link>
              : <span aria-hidden="true"><ChevronLeft size={19} /></span>}
            {next
              ? <Link href={next.href} aria-label={`Día siguiente: ${dayLabel(next.day)}`}><ChevronRight size={19} /></Link>
              : <span aria-hidden="true"><ChevronRight size={19} /></span>}
          </nav>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="day-empty" role="status">
          <CalendarX size={30} aria-hidden="true" />
          <p>No hay actividades {day === today ? "hoy" : "este día"} con estos filtros.</p>
          {next && <Link href={next.href}>Ver el {dayLabel(next.day).toLowerCase()} <ArrowRight size={17} /></Link>}
        </div>
      ) : (
        <>
          {timed.length > 0 && <ol className="day-list">{timed.map((entry) => <DayItem key={entry.event.id} entry={entry} />)}</ol>}
          {allDay.length > 0 && (
            <>
              <h4 className="day-subtitle">Todo el día y muestras en curso</h4>
              <ul className="day-list">{allDay.map((entry) => <DayItem key={entry.event.id} entry={entry} />)}</ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

function DayItem({ entry: { event, occurrence, allDay, until } }: { entry: DayEntry }) {
  const endsSameDay = occurrence.endsAt && !until && occurrence.endsAt !== occurrence.startsAt
    && tucumanDate(occurrence.endsAt) === tucumanDate(occurrence.startsAt);

  return (
    <li>
      <Link className="day-item" href={`/eventos/${event.slug}`}>
        <span className={allDay ? "day-time all-day" : "day-time"}>
          {allDay
            ? <>Todo<small>el día</small></>
            : <>{formatClock(occurrence.startsAt)}{endsSameDay && <small>a {formatClock(occurrence.endsAt!)}</small>}</>}
        </span>
        <span className="day-thumb"><Image src={event.imageUrl} alt="" fill sizes="72px" /></span>
        <span className="day-info">
          <strong>{event.title}</strong>
          <span><MapPin size={15} aria-hidden="true" /> {event.place.name}</span>
          {until && <em>Hasta el {shortDay(until)}</em>}
        </span>
        <span className="day-tags">
          {event.categories.slice(0, 2).map((category) => (
            <span key={category.slug}><span aria-hidden="true">{categoryEmoji(category)}</span> {category.name}</span>
          ))}
          <span className={event.accessType === "free" ? "free" : undefined}>{accessLabel(event.accessType, event.price)}</span>
        </span>
      </Link>
    </li>
  );
}
