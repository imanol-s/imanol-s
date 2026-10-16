import { test, expect } from "@playwright/test";

// Collect JS errors across every test
let pageErrors: string[];
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
  { name: "Library case study", path: "/projects/library-management/" },
  { name: "Project detail", path: "/projects/crime-analysis/" },
  { name: "Automaton case study", path: "/projects/automaton/" },
];

async function expectOpaqueCanvas(page: import("@playwright/test").Page) {
  const { background, tokenBackground } = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--color-background-dark)";
    document.body.append(probe);
    const tokenBackground = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      background: getComputedStyle(document.documentElement).backgroundColor,
      tokenBackground,
    };
  });

  expect(background).toBe(tokenBackground);
  expect(background).toMatch(/^rgb\(/);
}

for (const { name, path } of pages) {
  test.describe(name, () => {
    test("renders heading and no broken images", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator('a[href^="/blog"]')).toHaveCount(0);

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

test("removed blog URLs return 404", async ({ request }) => {
  for (const path of ["/blog/", "/blog/overcoming-ingrained-introversion/"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
});

test.describe("Layout", () => {
  test("root canvas stays opaque across routes and navigation", async ({
    browser,
    baseURL,
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expectOpaqueCanvas(page);

    await page.locator('.desktop-links a[href="/#projects"]').click();
    await expect(page.locator("#projects h2")).toBeInViewport();
    await expectOpaqueCanvas(page);

    await page
      .locator('a.project-card[href="/projects/library-management"]')
      .click();
    await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
    await expectOpaqueCanvas(page);

    await page.locator('.desktop-links a[href="/#projects"]').click();
    await expect(page).toHaveURL("/#projects");
    await expectOpaqueCanvas(page);

    const missingPage = await page.goto("/__background-canvas-missing__/");
    expect(missingPage?.status()).toBe(404);
    await expectOpaqueCanvas(page);

    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
    });
    const noScriptPage = await context.newPage();
    try {
      for (const path of [
        "/",
        "/projects/library-management/",
        "/__background-canvas-missing__/",
      ]) {
        const response = await noScriptPage.goto(path);
        if (path.startsWith("/__")) expect(response?.status()).toBe(404);
        await expectOpaqueCanvas(noScriptPage);
      }
    } finally {
      await context.close();
    }
  });

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
    await expect(
      page.locator('.desktop-links a[href="/#projects"]'),
    ).toBeVisible();
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

test("homepage supporting labels remain readable and project tags wrap without separators", async ({
  page,
}) => {
  for (const width of [390, 900, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    for (const selector of [
      ".career-dates",
      ".current-label",
      ".profile-panel > .section-kicker",
      ".profile-block h3",
      ".nav-link",
      ".header-resume",
    ]) {
      const labels = page.locator(selector);
      expect(await labels.count(), selector).toBeGreaterThan(0);
      for (const label of await labels.all()) {
        expect(
          await label.evaluate((element) =>
            parseFloat(getComputedStyle(element).fontSize),
          ),
          selector,
        ).toBeGreaterThanOrEqual(12);
      }
    }
    const cards = page.locator(".project-card");
    await expect(cards).toHaveCount(5);
    for (const card of await cards.all()) {
      const tags = card.locator(".project-tags span");
      expect(await tags.count()).toBeGreaterThan(0);
      for (const tag of await tags.all()) {
        expect(
          await tag.evaluate(
            (element) => getComputedStyle(element, "::before").content,
          ),
        ).not.toContain("/");
        const tagBox = await tag.boundingBox();
        const cardBox = await card.boundingBox();
        expect(tagBox!.x).toBeGreaterThanOrEqual(cardBox!.x);
        expect(tagBox!.x + tagBox!.width).toBeLessThanOrEqual(
          cardBox!.x + cardBox!.width,
        );
      }
    }
  }
});
