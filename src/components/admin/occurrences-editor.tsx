"use client";

import { CirclePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { OCCURRENCE_STATUS_LABELS } from "@/components/admin/labels";

export interface OccurrenceRow {
  key: string;
  id: string;
  date: string;
  start: string;
  end: string;
  status: string;
}

const emptyRow = (key: string): OccurrenceRow => ({ key, id: "", date: "", start: "", end: "", status: "scheduled" });

/** Fechas del evento en hora de Tucumán. Cada fila manda occ_id/occ_date/occ_start/occ_end/occ_status. */
export function OccurrencesEditor({ initial }: { initial: OccurrenceRow[] }) {
  // La primera fila vacía tiene una clave fija: así el HTML del servidor y el del navegador coinciden.
  const [rows, setRows] = useState<OccurrenceRow[]>(initial.length ? initial : [emptyRow("nueva-0")]);
  const added = useRef(0);

  return (
    <div className="occurrences-editor">
      {rows.map((row, index) => (
        <div className="occurrence-row" key={row.key}>
          <input type="hidden" name="occ_id" value={row.id} />
          <label className="field"><span>Día</span><input id={`occ-date-${row.key}`} type="date" name="occ_date" defaultValue={row.date} /></label>
          <label className="field"><span>Empieza</span><input id={`occ-start-${row.key}`} type="time" name="occ_start" defaultValue={row.start} /></label>
          <label className="field"><span>Termina</span><input id={`occ-end-${row.key}`} type="time" name="occ_end" defaultValue={row.end} /></label>
          <label className="field"><span>Estado</span>
            <select id={`occ-status-${row.key}`} name="occ_status" defaultValue={row.status}>
              {Object.entries(OCCURRENCE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="button" className="icon-button" aria-label={`Quitar la fecha ${index + 1}`} onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}><X size={18} /></button>
        </div>
      ))}
      <button type="button" className="button button-secondary" onClick={() => setRows((current) => [...current, emptyRow(`agregada-${++added.current}`)])}><CirclePlus size={18} /> Agregar fecha</button>
      <p className="field-help">Hora de Tucumán. Si termina después de medianoche, poné la hora igual: se toma como el día siguiente.</p>
    </div>
  );
}
