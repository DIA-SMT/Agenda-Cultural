import { describe, expect, it } from "vitest";
import { addDays, endOfDay, isIsoDate, startOfDay, todayInTucuman, tucumanDate, weekendRange } from "./dates";

describe("tucumanDate", () => {
  it("matches the Intl date in Tucumán, before and after local midnight", () => {
    for (const instant of ["2026-11-20T02:59:59Z", "2026-11-20T03:00:00Z", "2026-06-30T23:30:00-03:00"]) {
      expect(tucumanDate(instant)).toBe(todayInTucuman(new Date(instant)));
    }
    expect(tucumanDate(Date.parse("2026-11-21T01:30:00-03:00"))).toBe("2026-11-21");
  });
});

describe("Tucumán dates", () => {
  it("uses the local day, not the UTC one", () => expect(todayInTucuman(new Date("2026-11-19T02:00:00Z"))).toBe("2026-11-18"));
  it("adds days across months", () => expect(addDays("2026-11-29", 3)).toBe("2026-12-02"));
  it("bounds a local day in UTC−3", () => {
    expect(startOfDay("2026-11-18").toISOString()).toBe("2026-11-18T03:00:00.000Z");
    expect(endOfDay("2026-11-18").toISOString()).toBe("2026-11-19T02:59:59.999Z");
  });
  it("validates ISO dates", () => {
    expect(isIsoDate("2026-11-18")).toBe(true);
    expect(isIsoDate("18/11/2026")).toBe(false);
    expect(isIsoDate("2026-13-40")).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
});

describe("weekend range", () => {
  it("points to the next Friday–Sunday on weekdays", () => expect(weekendRange("2026-09-14")).toEqual({ from: "2026-09-18", to: "2026-09-20" }));
  it("starts today on Friday", () => expect(weekendRange("2026-11-20")).toEqual({ from: "2026-11-20", to: "2026-11-22" }));
  it("starts today on Saturday", () => expect(weekendRange("2026-11-21")).toEqual({ from: "2026-11-21", to: "2026-11-22" }));
  it("is only today on Sunday", () => expect(weekendRange("2026-11-22")).toEqual({ from: "2026-11-22", to: "2026-11-22" }));
});
