import { addDays, fromTucumanParts, isIsoDate } from "@/lib/dates";
import { all } from "@/lib/forms";
import type { OccurrenceInput } from "@/services/admin/events";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const STATUSES = ["scheduled", "suspended", "rescheduled", "cancelled"];

/**
 * Las fechas del editor llegan como columnas paralelas (occ_date[], occ_start[]…), en hora de Tucumán.
 * Devuelve las fechas listas para guardar o el mensaje del primer problema.
 */
export function readOccurrences(form: FormData): OccurrenceInput[] | string {
  const ids = all(form, "occ_id");
  const dates = all(form, "occ_date");
  const starts = all(form, "occ_start");
  const ends = all(form, "occ_end");
  const statuses = all(form, "occ_status");
  const occurrences: OccurrenceInput[] = [];

  for (const [index, date] of dates.entries()) {
    const start = starts[index] ?? "";
    const end = ends[index] ?? "";
    // Una fila que quedó vacía no es un error: se ignora.
    if (!date && !start) continue;
    if (!isIsoDate(date) || !TIME.test(start)) return `La fecha ${index + 1} necesita día y hora de inicio.`;
    if (end && !TIME.test(end)) return `La hora de cierre de la fecha ${index + 1} no es válida.`;
    const status = statuses[index] || "scheduled";
    if (!STATUSES.includes(status)) return `El estado de la fecha ${index + 1} no es válido.`;
    // Si cierra a una hora "anterior" a la de inicio, termina al día siguiente (una función de 22 a 1).
    const endDate = end && end <= start ? addDays(date, 1) : date;
    occurrences.push({
      id: UUID.test(ids[index] ?? "") ? ids[index] : null,
      startsAt: fromTucumanParts(date, start),
      endsAt: end ? fromTucumanParts(endDate, end) : null,
      status: status as OccurrenceInput["status"],
    });
  }

  const startTimes = occurrences.map((occurrence) => occurrence.startsAt);
  if (new Set(startTimes).size !== startTimes.length) return "Hay dos fechas con el mismo día y hora de inicio.";
  return occurrences;
}
