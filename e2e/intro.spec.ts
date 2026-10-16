import { expect, test, type Page } from "@playwright/test";
import { ME } from "../src/config";

const hydratedOverlay = (page: Page) =>
  page
    .locator('astro-island[component-url*="LoadingOverlay"]:not([ssr])')
    .waitFor({ state: "attached" });

test("server-rendered name stays visible and the intro cannot block the hero action", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.removeItem("site-lifecycle-ready"),
  );
  await page.route(/\/_astro\/.*\.js(?:\?|$)/, (route) => route.abort());
  await page.goto("/");

  const heading = page.locator(".hero-name h1");
  await expect(heading).toHaveAccessibleName(ME.name);
  await expect(heading.locator("[data-typewriter-output]")).toHaveText(ME.name);
  const action = page.getByRole("link", { name: /Explore my work/ });
  await expect(action).toBeVisible();
  await action.click();
  await expect(page).toHaveURL(/#projects$/);
});

test("first-visit hydration keeps the full name while the transparent intro plays", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.removeItem("site-lifecycle-ready"),
  );
  await page.goto("/");
  const heading = page.locator(".hero-name h1");
  await expect(heading.locator("[data-typewriter-output]")).toHaveText(ME.name);
  const overlay = page.locator("[data-loading-overlay]");
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveClass(/pointer-events-none/);
  await expect(heading.locator("[data-typewriter-output]")).toHaveText(ME.name);
  await page.getByRole("link", { name: /Explore my work/ }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(overlay).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("site-lifecycle-ready")),
    )
    .toBe("true");
});

test("direct project visits skip the decorative intro", async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.removeItem("site-lifecycle-ready"),
  );
  await page.goto("/projects/library-management/");
  await page
    .locator('astro-island[component-url*="LoadingOverlay"]:not([ssr])')
    .waitFor({ state: "attached" });
  await expect(page.locator("[data-loading-overlay]")).toHaveCount(0);
  await expect(page.locator("main h1")).toBeVisible();
});

test("reduced motion skips the intro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await hydratedOverlay(page);
  await expect(page.locator("[data-loading-overlay]")).toHaveCount(0);
  await expect(
    page.locator(".hero-name h1 [data-typewriter-output]"),
  ).toHaveText(ME.name);
});

test("returning sessions skip the intro", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
  await page.reload();
  await hydratedOverlay(page);
  await expect(page.locator("[data-loading-overlay]")).toHaveCount(0);
});

test("data saver skips the intro", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.removeItem("site-lifecycle-ready");
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
  });
  await page.goto("/");
  await hydratedOverlay(page);
  await expect(page.locator("[data-loading-overlay]")).toHaveCount(0);
});

test("denied session storage does not crash the intro", async ({ page }) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "site-lifecycle-ready")
        throw new DOMException("Denied", "SecurityError");
      return getItem.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "site-lifecycle-ready")
        throw new DOMException("Denied", "SecurityError");
      return setItem.call(this, key, value);
    };
  });
  await page.goto("/");
  await expect(page.locator("[data-loading-overlay]")).toBeVisible();
  await expect(
    page.locator(".hero-name h1 [data-typewriter-output]"),
  ).toHaveText(ME.name);
  await expect(page.locator("[data-loading-overlay]")).toHaveCount(0);
});
