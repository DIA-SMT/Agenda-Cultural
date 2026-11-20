import { addDays } from "@/lib/dates";

// Fechas de calendario como texto: meses AAAA-MM y días AAAA-MM-DD, siempre en hora de Tucumán.

export function isIsoMonth(value?: string): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

export function monthOf(date: string) {
  return date.slice(0, 7);
}

export function addMonths(month: string, months: number) {
  const [year, index] = month.split("-").map(Number);
  return new Date(Date.UTC(year, index - 1 + months, 1)).toISOString().slice(0, 7);
}

export function lastDayOfMonth(month: string) {
  return addDays(`${addMonths(month, 1)}-01`, -1);
}

/** Las semanas del mes, de lunes a domingo; los casilleros de los meses vecinos quedan en null. */
export function monthWeeks(month: string): (string | null)[][] {
  const first = `${month}-01`;
  const mondayOffset = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(mondayOffset).fill(null);
  for (let day = first; monthOf(day) === month; day = addDays(day, 1)) cells.push(day);
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
// Los días ya están en hora de Tucumán: se formatean al mediodía UTC para que ningún huso los corra.
const atNoon = (date: string) => new Date(`${date}T12:00:00Z`);
const monthFormatter = new Intl.DateTimeFormat("es-AR", { month: "long", timeZone: "UTC" });
const dayFormatter = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const weekdayFormatter = new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "UTC" });
const shortDayFormatter = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });

/** "Noviembre" */
export function monthName(month: string) {
  return capitalize(monthFormatter.format(atNoon(`${month}-01`)));
}

/** "Viernes 20 de noviembre" */
export function dayLabel(date: string) {
  return capitalize(dayFormatter.format(atNoon(date)).replace(",", ""));
}

/** "vie" */
export function weekdayShort(date: string) {
  return weekdayFormatter.format(atNoon(date)).replace(".", "");
}

/** "30 nov" */
export function shortDay(date: string) {
  return shortDayFormatter.format(atNoon(date)).replace(".", "");
}
