import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dayLabel, monthName, monthWeeks } from "@/lib/calendar";
import { categoryEmoji } from "@/lib/category-emoji";
import type { DaySummary } from "@/services/events";

const WEEKDAYS = [
  ["Lun", "Lunes"], ["Mar", "Martes"], ["Mié", "Miércoles"], ["Jue", "Jueves"],
  ["Vie", "Viernes"], ["Sáb", "Sábado"], ["Dom", "Domingo"],
] as const;

interface MonthCalendarProps {
  month: string;
  days: Record<string, DaySummary>;
  today: string;
  selected?: string;
  dayHref: (day: string) => string;
  todayHref: string;
  prevHref?: string;
  nextHref?: string;
}

const activities = (count: number) => (count === 1 ? "actividad" : "actividades");

// Cuatro tonos según qué tan cargado está el día respecto del más cargado del mes.
function heatLevel(count: number, max: number) {
  return count ? Math.max(1, Math.ceil((count / max) * 4)) : 0;
}

export function MonthCalendar({ month, days, today, selected, dayHref, todayHref, prevHref, nextHref }: MonthCalendarProps) {
  const max = Math.max(1, ...Object.values(days).map((day) => day.count));

  return (
    <section className="month-calendar" aria-labelledby="calendar-title">
      <header className="calendar-head">
        <h3 id="calendar-title">{monthName(month)} <span>{month.slice(0, 4)}</span></h3>
        <nav className="calendar-nav" aria-label="Cambiar de mes">
          {prevHref
            ? <Link href={prevHref} scroll={false} aria-label="Mes anterior"><ChevronLeft size={20} /></Link>
            : <span aria-hidden="true"><ChevronLeft size={20} /></span>}
          <Link className="calendar-today" href={todayHref} scroll={false}>Hoy</Link>
          {nextHref
            ? <Link href={nextHref} scroll={false} aria-label="Mes siguiente"><ChevronRight size={20} /></Link>
            : <span aria-hidden="true"><ChevronRight size={20} /></span>}
        </nav>
      </header>

      <table className="calendar-table">
        <thead>
          <tr>
            {WEEKDAYS.map(([short, long], index) => (
              <th key={short} scope="col" className={index >= 5 ? "weekend" : undefined}><abbr title={long}>{short}</abbr></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(month).map((week) => (
            // Las semanas que ya pasaron se achican: no tienen nada para elegir.
            <tr key={week.find(Boolean)} className={week.every((day) => !day || day < today) ? "past-week" : undefined}>
              {week.map((day, index) => (
                <td key={day ?? `vacio-${index}`}>
                  {day && <CalendarDay day={day} summary={days[day]} max={max} today={today} selected={selected} href={dayHref(day)} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="calendar-legend">
        <span className="calendar-scale" aria-hidden="true">
          Menos {[1, 2, 3, 4].map((level) => <i key={level} data-heat={level} />)} Más actividades
        </span>
        <span>Tocá un día para ver qué hay.</span>
      </footer>
    </section>
  );
}

function CalendarDay({ day, summary, max, today, selected, href }: {
  day: string; summary?: DaySummary; max: number; today: string; selected?: string; href: string;
}) {
  const count = summary?.count ?? 0;
  const isToday = day === today;
  const className = ["calendar-day", isToday && "today", day === selected && "selected"].filter(Boolean).join(" ");
  const number = <span className="calendar-day-top"><b>{Number(day.slice(8))}</b>{isToday && <em>Hoy</em>}</span>;

  // Los días pasados y los que no tienen actividades no llevan a ningún lado.
  if (day < today || !count) {
    return <span className={`${className} ${day < today ? "past" : "empty"}`}>{number}</span>;
  }

  const selectedNote = day === selected ? " (el que estás viendo)" : "";
  return (
    <Link
      className={className}
      href={href}
      data-heat={heatLevel(count, max)}
      aria-current={isToday ? "date" : undefined}
      aria-label={`${dayLabel(day)}: ${count} ${activities(count)}${selectedNote}`}
    >
      {number}
      <span className="calendar-emojis" aria-hidden="true">
        {summary?.categories.map((category) => <span key={category.slug} title={category.name}>{categoryEmoji(category)}</span>)}
      </span>
      <span className="calendar-count" aria-hidden="true"><strong>{count}</strong> <small>{activities(count)}</small></span>
    </Link>
  );
}
