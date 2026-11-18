import type { Metadata } from "next";
import Link from "next/link";
import { CirclePlus, ExternalLink, Search } from "lucide-react";
import { STATUS_LABELS } from "@/components/admin/labels";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { formatEventDate, formatEventTime } from "@/lib/format";
import { listEventsAdmin } from "@/services/admin/events";

export const metadata: Metadata = { title: "Eventos" };

const notices: Record<string, string> = { guardado: "Evento guardado.", borrado: "Evento borrado." };
type Params = { ok?: string; q?: string; estado?: string };

export default async function EventsAdminPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireStaff();
  const { ok, q, estado } = await searchParams;
  const events = await listEventsAdmin(query, { search: q?.trim(), status: estado && estado in STATUS_LABELS ? estado : undefined });

  return (
    <div className="shell admin-main">
      <div className="admin-heading">
        <div><p className="section-kicker">Agenda</p><h1>Eventos</h1><p>Primero los que tienen fechas por venir, del más cercano al más lejano.</p></div>
        <Link className="button button-primary" href="/admin/eventos/nuevo"><CirclePlus size={19} /> Nuevo evento</Link>
      </div>
      {ok && notices[ok] && <p className="form-ok" role="status">{notices[ok]}</p>}
      <form className="admin-filters" action="/admin/eventos">
        <label className="field"><span>Buscar</span><div className="input-icon"><Search size={18} /><input id="events-search" type="search" name="q" defaultValue={q} placeholder="Título" /></div></label>
        <label className="field"><span>Estado</span>
          <select id="events-status" name="estado" defaultValue={estado ?? ""}>
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="button button-secondary" type="submit">Filtrar</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Evento</th><th>Próxima fecha</th><th>Lugar</th><th>Estado</th><th><span className="sr-only">Ver</span></th></tr></thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td><Link href={`/admin/eventos/${event.id}`}>{event.title}</Link>{event.featured && <span className="status status-featured">Destacado</span>}</td>
                <td>{event.next_start
                  ? <>{formatEventDate(new Date(event.next_start).toISOString())} · {formatEventTime(new Date(event.next_start).toISOString())}</>
                  : <span className="muted">{event.occurrences ? "Ya pasó" : "Sin fechas"}</span>}</td>
                <td>{event.place ?? <span className="muted">—</span>}</td>
                <td><span className={`status status-${event.status}`}>{STATUS_LABELS[event.status]}</span></td>
                <td>{event.status === "published" && <Link href={`/eventos/${event.slug}`} target="_blank" aria-label={`Ver ${event.title} en el sitio`}><ExternalLink size={16} /></Link>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && <p className="admin-empty">{q || estado ? "No hay eventos con esos filtros." : "Todavía no hay eventos: cargá el primero con “Nuevo evento”."}</p>}
      </div>
    </div>
  );
}
