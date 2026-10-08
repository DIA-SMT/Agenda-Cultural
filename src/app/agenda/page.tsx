import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, List, RotateCcw } from "lucide-react";
import { AgendaFilters } from "@/components/agenda/filters";
import { DemoNotice } from "@/components/demo-notice";
import { EventGrid } from "@/components/events/event-grid";
import { getEvents } from "@/services/events";

export const metadata: Metadata = {
  title: "Agenda cultural",
  description: "Buscá actividades por fecha, categoría, lugar y tipo de acceso en San Miguel de Tucumán.",
  alternates: { canonical: "/agenda" },
};

type SearchValue = string | string[] | undefined;
type SearchParams = Record<string, SearchValue>;
const first = (value: SearchValue) => Array.isArray(value) ? value[0] : value;

function dateRange(range?: string) {
  const now = new Date("2026-09-14T12:00:00-03:00");
  if (range === "today") {
    const date = now.toISOString().slice(0, 10);
    return { from: date, to: date };
  }
  if (range === "weekend") return { from: "2026-09-18", to: "2026-09-20" };
  return {};
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const range = first(params.range);
  const shortcutDates = dateRange(range);
  const values = {
    q: first(params.q), category: first(params.category), place: first(params.place),
    from: first(params.from) || shortcutDates.from, to: first(params.to) || shortcutDates.to,
    free: first(params.free), range,
  };
  const results = await getEvents({
    query: values.q, category: values.category, place: values.place,
    from: values.from, to: values.to, free: values.free === "1", pageSize: 12,
  });

  return (
    <div className="page-surface">
      <div className="page-hero agenda-hero">
        <div className="shell"><p className="section-kicker">Qué hacer</p><h1>La agenda de la ciudad</h1><p>Encontrá actividades por fecha, categoría o lugar.</p></div>
      </div>
      <div className="shell"><DemoNotice /></div>
      <div className="shell agenda-layout">
        <AgendaFilters values={values} />
        <section className="agenda-results" aria-labelledby="results-title">
          <div className="agenda-toolbar">
            <div><p className="results-count"><strong>{results.total}</strong> {results.total === 1 ? "actividad encontrada" : "actividades encontradas"}</p><h2 id="results-title">Próximas actividades</h2></div>
            <div className="view-controls" aria-label="Vista de resultados"><button className="active" type="button" aria-pressed="true"><List size={18} /> Lista</button><button type="button" disabled title="Disponible al conectar eventos reales"><CalendarDays size={18} /> Calendario</button></div>
          </div>
          <div className="shortcut-row" aria-label="Rangos rápidos">
            <Link className={range === "today" ? "active" : ""} href="/agenda?range=today">Hoy</Link>
            <Link className={range === "weekend" ? "active" : ""} href="/agenda?range=weekend">Este fin de semana</Link>
            {(Object.values(values).some(Boolean)) && <Link href="/agenda"><RotateCcw size={16} /> Restablecer</Link>}
          </div>
          <EventGrid events={results.items} />
        </section>
      </div>
    </div>
  );
}
