// @vitest-environment node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

async function sourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.includes(".test.") ? [path] : [];
  }));
  return nested.flat();
}

// postgres.js le pregunta al servidor el tipo de cada parámetro: si es json/jsonb, vuelve a codificar el valor con
// JSON.stringify y un texto JSON llega como un string escalar ("cannot extract elements from a scalar").
// PGlite no lo hace, así que los tests con PGlite no lo detectan: los parámetros JSON van como $1::text::jsonb.
describe("SQL parameters", () => {
  it("never cast a parameter straight to json/jsonb", async () => {
    const offenders: string[] = [];
    for (const file of await sourceFiles(join(process.cwd(), "src"))) {
      const text = await readFile(file, "utf8");
      for (const match of text.matchAll(/\$\d+::jsonb?\b/g)) offenders.push(`${file}: ${match[0]}`);
    }
    expect(offenders).toEqual([]);
  });
});
