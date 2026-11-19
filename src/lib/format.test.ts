import { describe, expect, it } from "vitest";
import { accessLabel, formatCalendarDate, formatEventDate, formatEventTime, formatLongDate } from "./format";

describe("event formatting", () => {
  it("adds the year only when it is not the current one", () => {
    const now = new Date("2026-11-18T12:00:00-03:00");
    expect(formatEventDate("2026-11-28T20:00:00-03:00", now)).not.toMatch(/2026/);
    expect(formatEventDate("2025-11-28T20:00:00-03:00", now)).toMatch(/28.*2025$/);
    // A las 22 h del 31/12 en Tucumán ya es 2027 en UTC: el año es el de Tucumán.
    expect(formatEventDate("2026-12-31T22:00:00-03:00", now)).not.toMatch(/2027/);
  });
  it("formats today's label in Spanish", () => expect(formatLongDate(new Date("2026-09-14T12:00:00-03:00"))).toBe("Lunes 14 de septiembre"));
  it("formats calendar dates in UTC", () => {
    expect(formatCalendarDate("2026-09-18T20:00:00-03:00")).toBe("20260918T230000Z");
    expect(formatCalendarDate("2026-09-18T23:00:00+00:00")).toBe("20260918T230000Z");
  });
  it("formats Tucumán local time", () => expect(formatEventTime("2026-09-18T20:00:00-03:00")).toBe("20:00 h"));
  it("labels free access", () => expect(accessLabel("free")).toBe("Gratis"));
  it("uses a supplied price", () => expect(accessLabel("paid", "$5.000")).toBe("$5.000"));
});
