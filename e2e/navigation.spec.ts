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
      .toBe(16);
    await expect(page.locator(".site-header")).not.toHaveAttribute("data-header-docked", "");
    await page.locator('.site-header .md\\:flex a[href="/projects"]').click();
    await expect(page).toHaveURL(/\/projects/);
  });

  test("floating header compacts, docks on descent and returns on ascent", async ({ page }) => {
    await page.goto("/");
    const header = page.locator(".site-header");
    await page.evaluate(() => window.scrollTo({ top: 50, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.evaluate(() => window.scrollTo({ top: 250, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-header-docked", "");
    await page.evaluate(() => window.scrollTo({ top: 210, behavior: "instant" }));
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).not.toHaveAttribute("data-header-compact", "");
  });

  test("closed mobile menu does not pin the header after pointer focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const button = page.locator("#mobile-menu-btn");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.evaluate(() => window.scrollTo({ top: 250, behavior: "instant" }));
    await expect(page.locator(".site-header")).not.toHaveAttribute("data-header-docked", "");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
    await expect(page.locator(".site-header")).toHaveAttribute("data-header-docked", "");
    await expect.poll(() => page.locator(".site-header").evaluate(header => header.getBoundingClientRect().width)).toBe(56);
  });

  test("404 page renders with back link", async ({ page }) => {
    const response = await page.goto("/nonexistent-page/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("text=Page not found")).toBeVisible();
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });
});
