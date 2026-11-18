import { describe, expect, it } from "vitest";
import { lines, slugify, submittedValues } from "./forms";
import { readOccurrences } from "./occurrences-form";

function form(entries: [string, string][]) {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return data;
}

describe("form helpers", () => {
  it("builds slugs without accents or symbols", () => {
    expect(slugify("Función de Teatro: ¡Ñandú & Cía!")).toBe("funcion-de-teatro-nandu-cia");
    expect(slugify("  --Casa   Histórica--  ")).toBe("casa-historica");
    expect(slugify("a".repeat(100)).length).toBe(80);
  });

  it("splits textareas into trimmed lines", () => {
    expect(lines(form([["h", " Lunes a viernes 9 a 13 h \r\n\n Sábados 10 a 14 h "]]), "h")).toEqual(["Lunes a viernes 9 a 13 h", "Sábados 10 a 14 h"]);
  });

  it("keeps repeated fields as lists when echoing values back", () => {
    expect(submittedValues(form([["title", "Hola"], ["occ_date", "2026-12-01"], ["occ_date", "2026-12-02"], ["$ACTION_ID_x", ""]])))
      .toEqual({ title: "Hola", occ_date: ["2026-12-01", "2026-12-02"] });
  });
});

describe("readOccurrences", () => {
  const row = (date: string, start: string, end = "", status = "scheduled", id = ""): [string, string][] =>
    [["occ_id", id], ["occ_date", date], ["occ_start", start], ["occ_end", end], ["occ_status", status]];

  it("turns Tucumán dates into instants and skips empty rows", () => {
    const result = readOccurrences(form([...row("2026-12-05", "20:30", "22:00"), ...row("", "")]));
    expect(result).toEqual([{ id: null, startsAt: "2026-12-05T20:30:00-03:00", endsAt: "2026-12-05T22:00:00-03:00", status: "scheduled" }]);
  });

  it("moves an end time past midnight to the next day", () => {
    const [occurrence] = readOccurrences(form(row("2026-12-31", "22:00", "01:00"))) as Exclude<ReturnType<typeof readOccurrences>, string>;
    expect(occurrence.endsAt).toBe("2027-01-01T01:00:00-03:00");
  });

  it("keeps ids only when they look like ids", () => {
    const id = "6f1c0b9e-2a3d-4e5f-8a9b-0c1d2e3f4a5b";
    const result = readOccurrences(form([...row("2026-12-05", "10:00", "", "cancelled", id), ...row("2026-12-06", "10:00", "", "scheduled", "1; drop table")]));
    expect(result).toMatchObject([{ id, status: "cancelled" }, { id: null }]);
  });

  it("explains what is wrong", () => {
    expect(readOccurrences(form(row("2026-12-05", "")))).toBe("La fecha 1 necesita día y hora de inicio.");
    expect(readOccurrences(form(row("2026-12-05", "25:00")))).toBe("La fecha 1 necesita día y hora de inicio.");
    expect(readOccurrences(form(row("2026-12-05", "10:00", "", "inventado")))).toBe("El estado de la fecha 1 no es válido.");
    expect(readOccurrences(form([...row("2026-12-05", "10:00"), ...row("2026-12-05", "10:00")]))).toBe("Hay dos fechas con el mismo día y hora de inicio.");
  });
});
