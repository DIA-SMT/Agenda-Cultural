import { describe, expect, it } from "vitest";
import { accessLabel, formatEventTime } from "./format";

describe("event formatting", () => {
  it("formats Tucumán local time", () => expect(formatEventTime("2026-09-18T20:00:00-03:00")).toBe("20:00 h"));
  it("labels free access", () => expect(accessLabel("free")).toBe("Gratis"));
  it("uses a supplied price", () => expect(accessLabel("paid", "$5.000")).toBe("$5.000"));
});
