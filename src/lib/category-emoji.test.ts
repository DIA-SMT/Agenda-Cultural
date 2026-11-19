import { describe, expect, it } from "vitest";
import { categoryEmoji } from "./category-emoji";

describe("categoryEmoji", () => {
  it("uses the emoji chosen for a known category", () => {
    expect(categoryEmoji({ slug: "danza" })).toBe("💃");
    expect(categoryEmoji({ slug: "corte-y-confeccion" })).toBe("✂️");
  });

  it("falls back to a keyword in the slug for categories created later", () => {
    expect(categoryEmoji({ slug: "feria-de-emprendedores" })).toBe("🛍️");
    expect(categoryEmoji({ slug: "talleres" })).toBe("🛠️");
  });

  it("uses a generic sparkle when nothing matches", () => {
    expect(categoryEmoji({ slug: "algo-nuevo" })).toBe("✨");
  });
});
