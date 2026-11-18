const TIME_ZONE = "America/Argentina/Tucuman";
// Argentina no aplica horario de verano: Tucumán está siempre en UTC−3.
const UTC_OFFSET = "-03:00";

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

export function isIsoDate(value?: string): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));
}

export function todayInTucuman(now = new Date()) {
  return isoDateFormatter.format(now);
}

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function weekendRange(today: string) {
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  if (weekday === 0) return { from: today, to: today };
  if (weekday >= 5) return { from: today, to: addDays(today, 7 - weekday) };
  return { from: addDays(today, 5 - weekday), to: addDays(today, 7 - weekday) };
}

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  timeZone: TIME_ZONE,
});

/** Fecha y hora de Tucumán para los campos date/time de un formulario. */
export function toTucumanParts(value: Date | string) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** Instante ISO a partir de una fecha y hora de Tucumán ingresadas en un formulario. */
export function fromTucumanParts(date: string, time: string) {
  return `${date}T${time}:00${UTC_OFFSET}`;
}

export function startOfDay(date: string) {
  return new Date(`${date}T00:00:00${UTC_OFFSET}`);
}

export function endOfDay(date: string) {
  return new Date(`${date}T23:59:59.999${UTC_OFFSET}`);
}
