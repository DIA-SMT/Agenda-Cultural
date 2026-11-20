"use client";

import Link from "next/link";
import { Filter, Search, X } from "lucide-react";
import { useRef } from "react";
import type { Category, Place } from "@/types/domain";

interface FilterValues {
  q?: string;
  category?: string;
  place?: string;
  from?: string;
  to?: string;
  free?: string;
  range?: string;
}

interface AgendaFiltersProps {
  values: FilterValues;
  categories: Category[];
  places: Place[];
  /** En el calendario las fechas se eligen en el mes: el formulario conserva la vista y el mes en lugar de pedirlas. */
  calendarMonth?: string;
}

export function AgendaFilters({ values, categories, places, calendarMonth }: AgendaFiltersProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const clearHref = calendarMonth ? `/agenda?view=calendar&month=${calendarMonth}` : "/agenda";

  const fields = (mobile = false) => (
    <form action="/agenda" method="get">
      {calendarMonth && <><input type="hidden" name="view" value="calendar" /><input type="hidden" name="month" value={calendarMonth} /></>}
      <label className="field wide"><span>Buscar</span><div className="input-icon"><Search size={18} /><input type="search" name="q" defaultValue={values.q} placeholder="Evento, lugar o actividad" /></div></label>
      <label className="field"><span>Categoría</span><select name="category" defaultValue={values.category || ""}><option value="">Todas</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></label>
      <label className="field"><span>Lugar</span><select name="place" defaultValue={values.place || ""}><option value="">Todos</option>{places.map((place) => <option key={place.id} value={place.slug}>{place.name}</option>)}</select></label>
      {!calendarMonth && <>
        <label className="field"><span>Desde</span><input type="date" name="from" defaultValue={values.from} /></label>
        <label className="field"><span>Hasta</span><input type="date" name="to" defaultValue={values.to} /></label>
      </>}
      <label className="check-field"><input type="checkbox" name="free" value="1" defaultChecked={values.free === "1"} /><span>Solo actividades gratuitas</span></label>
      <button className="button button-primary" type="submit">Aplicar filtros</button>
      {mobile && <Link className="mobile-clear" href={clearHref} onClick={() => dialogRef.current?.close()}>Limpiar filtros</Link>}
    </form>
  );

  return (
    <>
    <aside className="filter-panel desktop-filter" aria-label="Filtros de agenda">
      <div className="filter-heading"><Filter size={20} /><h2>Filtrar agenda</h2><Link href={clearHref}>Limpiar</Link></div>
      {fields()}
    </aside>
    <button className="mobile-filter-button" type="button" onClick={() => dialogRef.current?.showModal()}><Filter size={19} /> Filtrar agenda</button>
    <dialog className="mobile-filter-dialog" ref={dialogRef} aria-labelledby="mobile-filter-title">
      <div className="dialog-handle" aria-hidden="true" />
      <div className="filter-heading"><Filter size={20} /><h2 id="mobile-filter-title">Filtrar agenda</h2><button type="button" onClick={() => dialogRef.current?.close()} aria-label="Cerrar filtros"><X /></button></div>
      {fields(true)}
    </dialog>
    </>
  );
}
