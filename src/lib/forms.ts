// Lectura de formularios del panel. Los campos llegan siempre como texto: acá se normalizan una sola vez.

export function text(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function optionalText(form: FormData, name: string) {
  return text(form, name) || null;
}

/** Un textarea con un elemento por renglón (horarios, datos del espacio). */
export function lines(form: FormData, name: string) {
  return text(form, name).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function checkbox(form: FormData, name: string) {
  return form.get(name) === "on";
}

export function all(form: FormData, name: string) {
  return form.getAll(name).map((value) => (typeof value === "string" ? value.trim() : ""));
}

/** Archivos elegidos en un input file (el navegador manda uno vacío si no se eligió nada). */
export function files(form: FormData, name: string) {
  return form.getAll(name).filter((value): value is File => value instanceof File && value.size > 0);
}

export function slugify(value: string) {
  return value
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Ofrece la URL ingresada o, si quedó vacía, una armada con el nombre. */
export function slugFrom(form: FormData, source: string) {
  return slugify(text(form, "slug") || source);
}

/** Valores enviados, para volver a mostrarlos si el guardado falla (React limpia el formulario al enviarlo). */
export function submittedValues(form: FormData) {
  const values: Record<string, string | string[]> = {};
  for (const key of new Set(form.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const entries = form.getAll(key).filter((value): value is string => typeof value === "string");
    values[key] = entries.length > 1 ? entries : entries[0] ?? "";
  }
  return values;
}

/** Código de error de PostgreSQL de una violación de unicidad (slug repetido). */
export function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505";
}
