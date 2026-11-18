import postgres from "postgres";

// Sólo para código de servidor: DATABASE_URL no tiene prefijo NEXT_PUBLIC_ y no llega al navegador.
const databaseUrl = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(databaseUrl);

export type Query = <T>(text: string, params?: unknown[]) => Promise<T[]>;

/** Consultas con transacciones, para guardar de una vez un evento con sus fechas y categorías. */
export interface Db {
  query: Query;
  transaction<T>(work: (query: Query) => Promise<T>): Promise<T>;
}

// En desarrollo la recarga en caliente reevalúa el módulo; se reutiliza la conexión para no abrir una por cambio.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

function getSql() {
  if (!databaseUrl) throw new Error("La base de datos no está configurada (falta DATABASE_URL).");
  // DATABASE_POOL_MAX=1 sirve para probar contra PGlite, que mezcla consultas simultáneas de distintas conexiones.
  const max = Number(process.env.DATABASE_POOL_MAX) || 10;
  globalForDb.sql ??= postgres(databaseUrl, { max, idle_timeout: 30, onnotice: () => {} });
  return globalForDb.sql;
}

function queryWith(sql: postgres.Sql | postgres.TransactionSql): Query {
  return async <T>(text: string, params: unknown[] = []) => (await sql.unsafe(text, params as never[])) as unknown as T[];
}

export const query: Query = (text, params) => queryWith(getSql())(text, params);

export const db: Db = {
  query,
  transaction: async <T>(work: (query: Query) => Promise<T>) =>
    (await getSql().begin((tx) => work(queryWith(tx)))) as T,
};
