#!/usr/bin/env node
// Aplica en orden las migraciones de db/migrations que todavía no corrieron, cada una en su transacción.
// Con --seed carga además db/seed.sql (sólo desarrollo: crea contenido de demostración).
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "db", "migrations");
const withSeed = process.argv.includes("--seed");

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Definila en .env o .env.local.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });

try {
  await sql`create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const applied = new Set((await sql`select name from public.schema_migrations`).map((row) => row.name));
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files.filter((name) => !applied.has(name))) {
    const text = await readFile(join(migrationsDir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(text).simple();
      await tx`insert into public.schema_migrations (name) values (${file})`;
    });
    console.log(`Aplicada: ${file}`);
  }
  if (files.every((name) => applied.has(name))) console.log("No hay migraciones pendientes.");

  if (withSeed) {
    await sql.unsafe(await readFile(join(root, "db", "seed.sql"), "utf8")).simple();
    console.log("Seed de desarrollo cargado.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
