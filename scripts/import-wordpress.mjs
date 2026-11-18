#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const input = args.get("--input");
const reportPath = resolve(args.get("--report") || "migration-report.json");
const mode = args.get("--mode") || "dry-run";

if (!input) {
  console.error("Uso: node scripts/import-wordpress.mjs --input export.json [--report reporte.json] [--mode dry-run]");
  process.exit(1);
}
if (mode !== "dry-run") {
  console.error("Esta primera entrega sólo admite dry-run. La escritura se habilitará contra una base PostgreSQL de desarrollo.");
  process.exit(2);
}

const raw = JSON.parse(await readFile(resolve(input), "utf8"));
const records = Array.isArray(raw) ? raw : raw.events || [];
const seenLegacyIds = new Set();
const report = { mode, source: basename(input), generatedAt: new Date().toISOString(), totals: { received: records.length, valid: 0, duplicates: 0, review: 0 }, events: [], review: [] };

for (const record of records) {
  const legacyId = String(record.id ?? record.ID ?? "");
  if (!legacyId || seenLegacyIds.has(legacyId)) {
    report.totals.duplicates += 1;
    report.review.push({ legacyId: legacyId || null, reason: legacyId ? "Identificador duplicado" : "Falta identificador" });
    continue;
  }
  seenLegacyIds.add(legacyId);
  const title = record.title?.rendered ?? record.title ?? "";
  const slug = record.slug ?? "";
  const meta = record.meta ?? {};
  const starts = meta.evcal_srow ?? meta.start ?? null;
  if (!title || !slug || !starts) {
    report.totals.review += 1;
    report.review.push({ legacyId, reason: "Faltan título, slug o fecha EventON", title: title || null });
    continue;
  }
  report.totals.valid += 1;
  report.events.push({ legacyId, legacyUrl: record.link ?? null, title, slug, eventonStart: starts, eventonEnd: meta.evcal_erow ?? meta.end ?? null, recurrence: meta.evcal_repeat ?? null, status: "draft" });
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Dry-run completo: ${report.totals.valid} válidos, ${report.totals.duplicates} duplicados, ${report.totals.review} para revisión.`);
console.log(`Reporte: ${reportPath}`);
