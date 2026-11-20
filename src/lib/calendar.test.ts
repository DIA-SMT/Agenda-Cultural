import { describe, expect, it } from "vitest";
import { addMonths, dayLabel, isIsoMonth, lastDayOfMonth, monthName, monthWeeks, shortDay, weekdayShort } from "./calendar";

describe("calendar months", () => {
  it("validates months", () => {
    expect(isIsoMonth("2026-11")).toBe(true);
    expect(isIsoMonth("2026-13")).toBe(false);
    expect(isIsoMonth("2026-11-20")).toBe(false);
    expect(isIsoMonth(undefined)).toBe(false);
  });

  it("moves across years", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });

  it("knows the last day, leap years included", () => {
    expect(lastDayOfMonth("2026-11")).toBe("2026-11-30");
    expect(lastDayOfMonth("2028-02")).toBe("2028-02-29");
  });

  it("lays weeks out from Monday to Sunday", () => {
    const weeks = monthWeeks("2026-11");
    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, "2026-11-01"]);
    expect(weeks[3][4]).toBe("2026-11-20");
    expect(weeks[5]).toEqual(["2026-11-30", null, null, null, null, null, null]);
    expect(monthWeeks("2027-02")).toHaveLength(4);
  });
});

describe("calendar labels", () => {
  it("names months and days in Spanish", () => {
    expect(monthName("2026-11")).toBe("Noviembre");
    expect(dayLabel("2026-11-20")).toBe("Viernes 20 de noviembre");
    expect(weekdayShort("2026-11-22")).toBe("dom");
    expect(shortDay("2026-11-30")).toBe("30 nov");
  });
});
