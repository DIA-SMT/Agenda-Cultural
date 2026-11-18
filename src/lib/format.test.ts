import { describe, expect, it } from "vitest";
import { accessLabel, formatCalendarDate, formatEventTime, formatLongDate } from "./format";

describe("event formatting", () => {
  it("formats today's label in Spanish", () => expect(formatLongDate(new Date("2026-09-14T12:00:00-03:00"))).toBe("Lunes 14 de septiembre"));
  it("formats calendar dates in UTC", () => {
    expect(formatCalendarDate("2026-09-18T20:00:00-03:00")).toBe("20260918T230000Z");
    expect(formatCalendarDate("2026-09-18T23:00:00+00:00")).toBe("20260918T230000Z");
  });
  it("formats Tucumán local time", () => expect(formatEventTime("2026-09-18T20:00:00-03:00")).toBe("20:00 h"));
  it("labels free access", () => expect(accessLabel("free")).toBe("Gratis"));
  it("uses a supplied price", () => expect(accessLabel("paid", "$5.000")).toBe("$5.000"));
});
