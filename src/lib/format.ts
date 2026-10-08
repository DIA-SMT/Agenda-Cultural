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
