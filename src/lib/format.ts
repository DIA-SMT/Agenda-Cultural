const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "America/Argentina/Tucuman",
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Tucuman",
});

const longDateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Argentina/Tucuman",
});

export function formatLongDate(value: Date) {
  const label = longDateFormatter.format(value).replace(",", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Formato UTC compacto que esperan Google Calendar y los archivos .ics (20260918T230000Z).
export function formatCalendarDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const yearFormatter = new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: "America/Argentina/Tucuman" });

/** "vie, 28 nov"; con el año al final si no es el actual (los eventos importados llegan a años anteriores). */
export function formatEventDate(value: string, now = new Date()) {
  const date = new Date(value);
  const label = dateFormatter.format(date).replace(".", "");
  const year = yearFormatter.format(date);
  return year === yearFormatter.format(now) ? label : `${label} ${year}`;
}

/** "18:30" */
export function formatClock(value: string) {
  return timeFormatter.format(new Date(value));
}

export function formatEventTime(value: string) {
  return `${formatClock(value)} h`;
}

export function accessLabel(accessType: "free" | "paid" | "check", price?: string) {
  if (accessType === "free") return "Gratis";
  if (accessType === "paid") return price || "Pago";
  return "Consultar";
}
