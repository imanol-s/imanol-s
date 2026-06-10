import { test, expect } from "@playwright/test";

// Collect JS errors across every test
let pageErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
});
test.afterEach(() => {
  expect(pageErrors, "Page should have no JS errors").toHaveLength(0);
});

// Pages to verify
const pages = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects/" },
  { name: "Blog", path: "/blog/" },
  { name: "Project detail", path: "/projects/crime-analysis/" },
  { name: "Blog post", path: "/blog/overcoming-ingrained-introversion/" },
];

for (const { name, path } of pages) {
  test.describe(name, () => {
    test("renders heading and no broken images", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();

      // Wait for lazy-loaded images, then check all <img> elements loaded
      await page.waitForLoadState("networkidle");
      const brokenImages = await page.$$eval("img[src]", (imgs) =>
        imgs
          .filter(
            (img): img is HTMLImageElement =>
              img instanceof HTMLImageElement &&
              img.complete &&
              img.naturalWidth === 0 &&
              img.src !== "",
          )
          .map((img) => img.getAttribute("src")),
      );
      expect(brokenImages, "Broken images found").toHaveLength(0);
    });

    test("has no failed network requests", async ({ page }) => {
      const failed: string[] = [];
      page.on("response", (res) => {
        if (res.status() >= 400 && !res.url().includes("favicon")) {
          failed.push(`${res.status()} ${res.url()}`);
        }
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(failed, "Failed network requests").toHaveLength(0);
    });
  });
}

test.describe("Layout", () => {
  test("header and footer present on every page", async ({ page }) => {
    for (const { path } of pages) {
      await page.goto(path);
      await expect(page.locator("header, nav").first()).toBeVisible();
      await expect(page.locator("footer").first()).toBeVisible();
    }
  });

  test("responsive: mobile viewport renders without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const bodyWidth = await page.$eval("body", (el) => el.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test("responsive: desktop viewport renders full nav", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(page.locator('a[href*="/projects"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/blog"]').first()).toBeVisible();
  });
});

test.describe("Home page sections", () => {
  test("renders the hero title fallback without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://localhost:4321",
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    try {
      await page.goto("/");

      const hero = page.locator("main h1[aria-label]");
      await expect(hero).toHaveCount(1);
      await expect(hero).toBeVisible();

      const heroText = await hero.getAttribute("aria-label");
      if (!heroText) {
        throw new Error("Expected hero heading to expose aria-label");
      }

      const fallback = page.locator("[data-typewriter-fallback]");
      await expect(fallback).toBeVisible();
      await expect(fallback).toHaveText(heroText);
      await expect(page.locator("[data-typewriter-output]")).toBeHidden();
    } finally {
      await context.close();
    }
  });

  test("plays the homepage-only intro overlay before the hero resolves", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.removeItem("site-lifecycle-ready");
    });

    await page.goto("/");
    await expect(page.locator("#loading-overlay")).toHaveCount(1);

    await expect
      .poll(() =>
        page.evaluate(() => sessionStorage.getItem("site-lifecycle-ready")),
      )
      .toBe("true");
    await expect(page.locator('[data-loading-overlay="react"]')).toHaveCount(0);

    const hero = page.locator("main h1[aria-label]");
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();

    const heroText = await hero.getAttribute("aria-label");
    if (!heroText) {
      throw new Error("Expected hero heading to expose aria-label");
    }

    await expect(page.locator("[data-typewriter-output]")).toHaveText(heroText);
    await expect(
      page.getByRole("button", { name: "Skip typewriter animation" }),
    ).toHaveCount(0);
  });

  test("keeps the animated hero title on one line at the narrow browser size", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 431, height: 982 });
    await page.addInitScript(() => {
      sessionStorage.removeItem("site-lifecycle-ready");
    });

    await page.goto("/");

    const hero = page.locator("main h1[aria-label]");
    const heroText = await hero.getAttribute("aria-label");
    if (!heroText) {
      throw new Error("Expected hero heading to expose aria-label");
    }

    await expect(page.locator("[data-typewriter-output]")).toHaveText(heroText);

    const titleMetrics = await hero.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      return { height: rect.height, lineHeight };
    });

    expect(titleMetrics.height).toBeLessThanOrEqual(
      titleMetrics.lineHeight * 1.25,
    );
  });

  test("omits the intro overlay from blog and project routes", async ({
    page,
  }) => {
    for (const path of [
      "/blog/",
      "/blog/overcoming-ingrained-introversion/",
      "/projects/",
      "/projects/crime-analysis/",
    ]) {
      await page.goto(path);
      await expect(page.locator("#loading-overlay")).toHaveCount(0);
      await expect(page.locator("[data-loading-overlay]")).toHaveCount(0);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("profile image loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const profileImg = page
      .locator('img[alt*="Imanol" i], img[alt*="profile" i]')
      .first();
    if ((await profileImg.count()) > 0) {
      await expect(profileImg).toBeVisible();
      const natural = await profileImg.evaluate(
        (img: HTMLImageElement) => img.naturalWidth,
      );
      expect(natural).toBeGreaterThan(0);
    }
  });

  test("projects section visible on home", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#projects")).toBeVisible();
  });

  test("experience section visible on home", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=/experience/i").first()).toBeVisible();
  });
});
