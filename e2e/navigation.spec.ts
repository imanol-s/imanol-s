import { test, expect } from "@playwright/test";

test.describe("Site navigation", () => {
  test("nav links work across pages", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href*="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
  });

  test("404 page renders with back link", async ({ page }) => {
    const response = await page.goto("/nonexistent-page/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("text=Page not found")).toBeVisible();
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });
});
