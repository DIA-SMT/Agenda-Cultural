import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, List, RotateCcw } from "lucide-react";
import { DayAgenda } from "@/components/agenda/day-agenda";
import { AgendaFilters } from "@/components/agenda/filters";
import { MonthCalendar } from "@/components/agenda/month-calendar";
import { DemoNotice } from "@/components/demo-notice";
import { EventGrid } from "@/components/events/event-grid";
import { addMonths, isIsoMonth, lastDayOfMonth, monthName, monthOf } from "@/lib/calendar";
import { isIsoDate, todayInTucuman, weekendRange } from "@/lib/dates";
import { getAgendaOptions, getCalendarDays, getDayEvents, getEvents } from "@/services/events";
import type { EventFilters } from "@/types/domain";

export const metadata: Metadata = {
  title: "Agenda cultural",
  description: "Buscá actividades por fecha, categoría, lugar y tipo de acceso en San Miguel de Tucumán.",
  alternates: { canonical: "/agenda" },
};

type SearchValue = string | string[] | undefined;
type SearchParams = Record<string, SearchValue>;
const first = (value: SearchValue) => Array.isArray(value) ? value[0] : value;

function dateRange(range?: string): { from?: string; to?: string } {
  const today = todayInTucuman();
  if (range === "today") return { from: today, to: today };
  if (range === "weekend") return weekendRange(today);
  return {};
}

interface Values { q?: string; category?: string; place?: string; from?: string; to?: string; free?: string; range?: string }

// Lo que comparten la lista y el calendario: búsqueda, categoría, lugar y gratuidad (las fechas no).
function sharedQuery(values: Values) {
  const query = new URLSearchParams();
  for (const key of ["q", "category", "place", "free"] as const) if (values[key]) query.set(key, values[key]);
  return query;
}

const agendaHref = (query: URLSearchParams) => (query.size ? `/agenda?${query}` : "/agenda");

export default async function AgendaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const range = first(params.range);
  const shortcutDates = dateRange(range);
  const values: Values = {
    q: first(params.q), category: first(params.category), place: first(params.place),
    from: first(params.from) || shortcutDates.from, to: first(params.to) || shortcutDates.to,
    free: first(params.free), range,
  };
  const filters: EventFilters = { query: values.q, category: values.category, place: values.place, free: values.free === "1" };
  const isCalendar = first(params.view) === "calendar";
  const options = await getAgendaOptions();

  // Desde la lista, el calendario abre en el día que se estaba filtrando.
  const today = todayInTucuman();
  const calendarQuery = sharedQuery(values);
  calendarQuery.set("view", "calendar");
  if (!isCalendar && isIsoDate(values.from) && values.from >= today) calendarQuery.set("day", values.from);
  const toggle = { list: agendaHref(sharedQuery(values)), calendar: agendaHref(calendarQuery) };

  return (
    <div className="page-surface">
      <div className="page-hero agenda-hero">
        <div className="shell"><p className="section-kicker">Qué hacer</p><h1>La agenda de la ciudad</h1><p>Encontrá actividades por fecha, categoría o lugar.</p></div>
      </div>
      <div className="shell"><DemoNotice /></div>
      <div className="shell agenda-layout">
        {isCalendar
          ? <CalendarView params={params} values={values} filters={filters} today={today} toggle={toggle} options={options} />
          : <ListView params={params} values={values} filters={filters} toggle={toggle} options={options} />}
      </div>
    </div>
  );
}

interface ViewProps {
  params: SearchParams;
  values: Values;
  filters: EventFilters;
  toggle: { list: string; calendar: string };
  options: Awaited<ReturnType<typeof getAgendaOptions>>;
}

function ViewToggle({ active, toggle }: { active: "list" | "calendar"; toggle: ViewProps["toggle"] }) {
  return (
    <nav className="view-controls" aria-label="Vista de resultados">
      <Link className={active === "list" ? "active" : undefined} aria-current={active === "list" ? "page" : undefined} href={toggle.list}><List size={18} /> Lista</Link>
      <Link className={active === "calendar" ? "active" : undefined} aria-current={active === "calendar" ? "page" : undefined} href={toggle.calendar}><CalendarDays size={18} /> Calendario</Link>
    </nav>
  );
}

async function ListView({ params, values, filters, toggle, options }: ViewProps) {
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "", 10) || 1);
  const results = await getEvents({ ...filters, from: values.from, to: values.to, page, pageSize: 12 });
  const totalPages = Math.max(1, Math.ceil(results.total / results.pageSize));
  // Las páginas conservan los filtros tal como vinieron (incluido el atajo "Hoy" o "Este fin de semana").
  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      const single = first(value);
      if (single && key !== "page") query.set(key, single);
    }
    if (target > 1) query.set("page", String(target));
    return agendaHref(query);
  };

  return (
    <>
      <AgendaFilters values={values} categories={options.categories} places={options.places} />
      <section className="agenda-results" aria-labelledby="results-title">
        <div className="agenda-toolbar">
          <div><p className="results-count"><strong>{results.total}</strong> {results.total === 1 ? "actividad encontrada" : "actividades encontradas"}</p><h2 id="results-title">Próximas actividades</h2></div>
          <ViewToggle active="list" toggle={toggle} />
        </div>
        <div className="shortcut-row" aria-label="Rangos rápidos">
          <Link className={values.range === "today" ? "active" : ""} href="/agenda?range=today">Hoy</Link>
          <Link className={values.range === "weekend" ? "active" : ""} href="/agenda?range=weekend">Este fin de semana</Link>
          {(Object.values(values).some(Boolean)) && <Link href="/agenda"><RotateCcw size={16} /> Restablecer</Link>}
        </div>
        <EventGrid events={results.items} />
        {totalPages > 1 && (
          <nav className="pager" aria-label="Páginas de resultados">
            {page > 1 ? <Link href={pageHref(page - 1)} rel="prev"><ArrowLeft size={17} /> Anteriores</Link> : <span />}
            <span>Página {Math.min(page, totalPages)} de {totalPages}</span>
            {page < totalPages ? <Link href={pageHref(page + 1)} rel="next">Siguientes <ArrowRight size={17} /></Link> : <span />}
          </nav>
        )}
      </section>
    </>
  );
}

async function CalendarView({ params, values, filters, today, toggle, options }: ViewProps & { today: string }) {
  // Se puede pedir un día (?day=) o un mes (?month=); nunca antes de hoy, que lo pasado ya no está en la agenda.
  const currentMonth = monthOf(today);
  const dayParam = first(params.day);
  const monthParam = first(params.month);
  const requestedDay = isIsoDate(dayParam) && dayParam >= today ? dayParam : undefined;
  const month = requestedDay ? monthOf(requestedDay) : isIsoMonth(monthParam) && monthParam > currentMonth ? monthParam : currentMonth;
  const monthStart = month === currentMonth ? today : `${month}-01`;

  const calendar = await getCalendarDays(filters, monthStart, lastDayOfMonth(month));
  const activeDays = Object.keys(calendar.days).sort();
  const selected = requestedDay ?? activeDays[0] ?? monthStart;
  const entries = await getDayEvents(filters, selected);

  const href = (extra: Record<string, string>) => {
    const query = sharedQuery(values);
    query.set("view", "calendar");
    for (const [key, value] of Object.entries(extra)) query.set(key, value);
    return agendaHref(query);
  };
  const dayHref = (day: string) => `${href({ day })}#dia`;
  const nextMonth = addMonths(month, 1);
  const previousActive = activeDays.findLast((day) => day < selected);
  const nextActive = activeDays.find((day) => day > selected);
  const filtered = Boolean(values.q || values.category || values.place || values.free);

  return (
    <>
      <AgendaFilters values={values} categories={options.categories} places={options.places} calendarMonth={month} />
      <section className="agenda-results" aria-labelledby="results-title">
        <div className="agenda-toolbar">
          <div>
            <p className="results-count">
              <strong>{calendar.total}</strong> {calendar.total === 1 ? "actividad" : "actividades"} {month === currentMonth ? "de hoy a fin de mes" : `en ${monthName(month).toLowerCase()}`}
            </p>
            <h2 id="results-title">Calendario</h2>
          </div>
          <ViewToggle active="calendar" toggle={toggle} />
        </div>
        {filtered && (
          <div className="shortcut-row">
            <Link href={`/agenda?view=calendar&month=${month}`}><RotateCcw size={16} /> Ver todas las actividades</Link>
          </div>
        )}
        <MonthCalendar
          month={month}
          days={calendar.days}
          today={today}
          selected={selected}
          dayHref={dayHref}
          todayHref={href({ day: today })}
          prevHref={month > currentMonth ? href({ month: addMonths(month, -1) }) : undefined}
          nextHref={calendar.lastDay && nextMonth <= monthOf(calendar.lastDay) ? href({ month: nextMonth }) : undefined}
        />
        <DayAgenda
          day={selected}
          today={today}
          entries={entries}
          previous={previousActive ? { day: previousActive, href: dayHref(previousActive) } : undefined}
          next={nextActive ? { day: nextActive, href: dayHref(nextActive) } : undefined}
        />
      </section>
    </>
  );
}
