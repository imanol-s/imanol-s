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
