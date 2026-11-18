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

export function formatEventDate(value: string) {
  return dateFormatter.format(new Date(value)).replace(".", "");
}

export function formatEventTime(value: string) {
  return `${timeFormatter.format(new Date(value))} h`;
}

export function accessLabel(accessType: "free" | "paid" | "check", price?: string) {
  if (accessType === "free") return "Gratis";
  if (accessType === "paid") return price || "Pago";
  return "Consultar";
}
