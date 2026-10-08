import { expect, test } from "@playwright/test";

test("searches the agenda and opens an event", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Buscar eventos, lugares o actividades…").fill("musical");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/agenda\?q=musical/);
  await expect(page.getByText("1 actividad encontrada")).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/eventos\/encuentro-musical-demo/),
    page.getByRole("link", { name: /Ver evento: Encuentro musical/ }).click(),
  ]);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Encuentro musical");
});

test("keeps filters in the URL", async ({ page }) => {
  await page.goto("/agenda?category=teatro&free=1");
  if (await page.getByRole("button", { name: "Filtrar agenda" }).isVisible()) {
    await page.getByRole("button", { name: "Filtrar agenda" }).click();
  }
  await expect(page.getByLabel("Categoría").filter({ visible: true })).toHaveValue("teatro");
  await expect(page.getByLabel("Solo actividades gratuitas").filter({ visible: true })).toBeChecked();
});
