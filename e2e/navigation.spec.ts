import { test, expect, type Page } from "@playwright/test";

const waitForNavigation = async (page: Page) => {
  const header = page.locator(".site-header");
  await expect
    .poll(() =>
      header.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue(
          "--header-expanded-width",
        ),
      ),
    )
    .not.toBe("");
  return header;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

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
    const header = await waitForNavigation(page);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-brand")).toBeFocused();
    await page.evaluate(() =>
      window.scrollTo({ top: 200, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect
      .poll(() =>
        header.evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBe(12);
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.locator('.desktop-links a[href="/projects"]').click();
    await expect(page).toHaveURL(/\/projects/);
  });

  test("floating header compacts, docks on descent and returns on ascent", async ({
    page,
  }) => {
    await page.goto("/");
    const header = await waitForNavigation(page);
    await page.evaluate(() =>
      window.scrollTo({ top: 50, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.evaluate(() =>
      window.scrollTo({ top: 250, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-docked", "");
    await page.evaluate(() =>
      window.scrollTo({ top: 210, behavior: "instant" }),
    );
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).not.toHaveAttribute("data-header-compact", "");
  });

  test("closed mobile menu does not pin the header after pointer focus", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const header = await waitForNavigation(page);
    const button = page.locator("#mobile-menu-btn");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.evaluate(() =>
      window.scrollTo({ top: 250, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await page.evaluate(() =>
      window.scrollTo({ top: 400, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-docked", "");
    await expect
      .poll(() =>
        header.evaluate((element) =>
          Math.round(
            element.querySelector(".header-end")!.getBoundingClientRect()
              .right - element.getBoundingClientRect().left,
          ),
        ),
      )
      .toBe(56);
  });

  test("404 page renders with back link", async ({ page }) => {
    const response = await page.goto("/nonexistent-page/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("text=Page not found")).toBeVisible();
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });
});
