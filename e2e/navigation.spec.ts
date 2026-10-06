import { test, expect } from "@playwright/test";

test.describe("Site navigation", () => {
  test("nav links work across pages", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href*="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
  });

  test("keyboard navigation remains clickable after switching to pointer input", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-brand")).toBeFocused();
    await page.evaluate(() =>
      window.scrollTo({ top: 200, behavior: "instant" }),
    );
    await expect
      .poll(() =>
        page
          .locator(".site-header")
          .evaluate((header) => header.getBoundingClientRect().top),
      )
      .toBe(0);
    await expect(page.locator("[data-scroll-frog]")).toBeHidden();
    await page.locator('.site-header .md\\:flex a[href="/projects"]').click();
    await expect(page).toHaveURL(/\/projects/);
  });

  test("404 page renders with back link", async ({ page }) => {
    const response = await page.goto("/nonexistent-page/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("text=Page not found")).toBeVisible();
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });
});
