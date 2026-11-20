import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dayLabel, weekdayShort } from "@/lib/calendar";
import { categoryEmoji } from "@/lib/category-emoji";
import { addDays } from "@/lib/dates";
import type { DaySummary } from "@/services/events";

/** Los próximos siete días con cuántas actividades tiene cada uno; cada día abre el calendario de la agenda. */
export function WeekStrip({ today, days }: { today: string; days: Record<string, DaySummary> }) {
  const week = Array.from({ length: 7 }, (_, index) => addDays(today, index));

  return (
    <div className="week-strip">
      <div className="week-strip-head">
        <h3 id="week-title">La semana en la agenda</h3>
        <Link href="/agenda?view=calendar">Ver el calendario del mes <ArrowRight size={18} /></Link>
      </div>
      <ol aria-labelledby="week-title">
        {week.map((day, index) => {
          const summary = days[day];
          const count = summary?.count ?? 0;
          const name = index === 0 ? "Hoy" : index === 1 ? "Mañana" : weekdayShort(day);
          return (
            <li key={day}>
              <Link
                className={["week-day", index === 0 && "today", !count && "empty"].filter(Boolean).join(" ")}
                href={`/agenda?view=calendar&day=${day}#dia`}
                aria-label={`${dayLabel(day)}: ${count ? `${count} ${count === 1 ? "actividad" : "actividades"}` : "sin actividades"}`}
              >
                <small>{name}</small>
                <b>{Number(day.slice(8))}</b>
                <span className="week-emojis" aria-hidden="true">
                  {summary?.categories.slice(0, 2).map((category) => <span key={category.slug}>{categoryEmoji(category)}</span>)}
                </span>
                <span className="week-count">{count ? `${count} ${count === 1 ? "actividad" : "actividades"}` : "Sin actividades"}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
