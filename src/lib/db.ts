import postgres from "postgres";

// Sólo para código de servidor: DATABASE_URL no tiene prefijo NEXT_PUBLIC_ y no llega al navegador.
const databaseUrl = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(databaseUrl);

export type Query = <T>(text: string, params?: unknown[]) => Promise<T[]>;

// En desarrollo la recarga en caliente reevalúa el módulo; se reutiliza la conexión para no abrir una por cambio.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

function getSql() {
  if (!databaseUrl) throw new Error("La base de datos no está configurada (falta DATABASE_URL).");
  globalForDb.sql ??= postgres(databaseUrl, { max: 10, idle_timeout: 30, onnotice: () => {} });
  return globalForDb.sql;
}

export const query: Query = async <T>(text: string, params: unknown[] = []) =>
  (await getSql().unsafe(text, params as never[])) as unknown as T[];
