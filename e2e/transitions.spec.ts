import { test, expect, type Page } from "@playwright/test";

const detail = "/projects/library-management";

for (const width of [390, 1440]) {
  test(`cold history navigation restores position without a scroll sweep at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await page.goto("/");
    await page.evaluate(() => sessionStorage.clear());
    await Promise.all([
      page.waitForEvent("load"),
      cdp.send("Page.reload", { ignoreCache: true }),
    ]);
    const card = page.locator(`a.project-card[href="${detail}"]`);
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      Object.assign(window, { restoredScrolls: [] as number[] });
      document.addEventListener("astro:after-swap", () => {
        if (location.pathname !== "/") return;
        const samples = Reflect.get(window, "restoredScrolls") as number[];
        let remaining = 30;
        const sample = () => {
          samples.push(scrollY);
          if (--remaining) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
    });
    const savedY = await page.evaluate(() => scrollY);
    expect(savedY).toBeGreaterThan(100);
    await card.click();
    await expect(page).toHaveURL(detail);
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(window, "restoredScrolls").length),
      )
      .toBe(30);
    const positions: number[] = await page.evaluate(() =>
      Reflect.get(window, "restoredScrolls"),
    );
    expect(positions.every((y) => Math.abs(y - savedY) <= 1)).toBe(true);
    await page.goForward();
    await expect(page).toHaveURL(detail);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await cdp.detach();
  });
}

async function prepareHero(page: Page) {
  const response = await page.request.get(detail);
  expect(response.ok()).toBe(true);
  const html = await page.evaluate(
    (source) => {
      const incoming = new DOMParser().parseFromString(source, "text/html");
      const hero = incoming.querySelector<HTMLImageElement>(
        ".project-opening-art img",
      );
      if (!hero) throw new Error("Required detail hero is missing");
      const src = hero.getAttribute("src")!;
      hero.srcset = [400, 800, 1200]
        .map((width) => `${src}?readiness-width=${width} ${width}w`)
        .join(", ");
      return "<!doctype html>" + incoming.documentElement.outerHTML;
    },
    await response.text(),
  );
  await page.route(/\/projects\/library-management\/?$/, (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: html }),
  );
  await page.locator(".site-brand").evaluate((link, href) => {
    link.setAttribute("href", href);
  }, detail);
}

async function captureFirstPaint(page: Page) {
  await page.evaluate(() => {
    const samples: { ready: boolean; source: string; covered: boolean }[] = [];
    Object.assign(window, { transitionPaints: samples });
    document.addEventListener("astro:after-swap", () => {
      const overlay = document.getElementById("loading-overlay");
      const covered = Boolean(
        overlay &&
        getComputedStyle(overlay).display !== "none" &&
        getComputedStyle(overlay).visibility !== "hidden" &&
        getComputedStyle(overlay).opacity !== "0",
      );
      requestAnimationFrame(() => {
        const image = document.querySelector<HTMLImageElement>(
          ".project-opening-art img",
        );
        samples.push({
          ready: Boolean(image?.complete && image.naturalWidth > 0),
          source: image?.currentSrc ?? "",
          covered,
        });
      });
    });
  });
}

const paints = (page: Page) =>
  page.evaluate(
    () =>
      Reflect.get(window, "transitionPaints") as {
        ready: boolean;
        source: string;
        covered: boolean;
      }[],
  );

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

for (const width of [390, 1280]) {
  test(`shows the project before its responsive artwork loads at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/404/");
    await prepareHero(page);
    await captureFirstPaint(page);
    let release!: () => void;
    let requested!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const seen = new Promise<void>((resolve) => {
      requested = resolve;
    });
    const candidates: string[] = [];
    await page.route(/readiness-width=/, async (route) => {
      candidates.push(
        new URL(route.request().url()).searchParams.get("readiness-width")!,
      );
      requested();
      await held;
      await route.continue();
    });
    try {
      await page.locator(".site-brand").click();
      await seen;
      await expect(page.locator("#main-content h1")).toHaveText(
        "Library Management System",
        { timeout: 600 },
      );
      await expect.poll(() => paints(page)).toHaveLength(1);
      const [first] = await paints(page);
      expect(first.ready).toBe(false);
      expect(first.covered).toBe(false);
      const artwork = page.locator(".project-opening-art img");
      const reserved = await artwork.boundingBox();
      expect(reserved?.height).toBeGreaterThan(100);
      expect(candidates).toEqual([width === 1280 ? "800" : "400"]);
      release();
      await expect
        .poll(() =>
          artwork.evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const loaded = await artwork.boundingBox();
      expect(loaded?.height).toBeCloseTo(reserved!.height, 1);
    } finally {
      release();
    }
    await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
    await expect.poll(() => paints(page)).toHaveLength(1);
    expect(
      await page
        .locator(".project-opening-art img")
        .evaluate((image: HTMLImageElement) => image.currentSrc),
    ).toContain(`readiness-width=${width === 1280 ? "800" : "400"}`);
  });
}

for (const failure of ["broken", "stalled"]) {
  test(`shows the project promptly when its artwork is ${failure}`, async ({
    page,
  }) => {
    await page.goto("/404/");
    await prepareHero(page);
    await captureFirstPaint(page);
    let release!: () => void;
    let requested!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const seen = new Promise<void>((resolve) => {
      requested = resolve;
    });
    let started = 0;
    await page.route(/readiness-width=/, async (route) => {
      started ||= Date.now();
      requested();
      if (failure === "stalled") await held;
      await route.fulfill({ status: 404, body: "Unavailable image" });
    });
    try {
      await page.locator(".site-brand").click();
      await seen;
      await expect(page.locator("#main-content h1")).toHaveText(
        "Library Management System",
        { timeout: 600 },
      );
      expect(Date.now() - started).toBeLessThan(600);
      await expect.poll(() => paints(page)).toHaveLength(1);
      const [first] = await paints(page);
      expect(first.covered).toBe(false);
      expect(first.ready).toBe(false);
    } finally {
      release();
      await page.unrouteAll({ behavior: "wait" });
    }
  });
}

test("aborts stale artwork preparation and preserves keyboard and history navigation", async ({
  page,
}) => {
  await page.goto("/404/");
  await prepareHero(page);
  let release!: () => void;
  let requested!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const seen = new Promise<void>((resolve) => {
    requested = resolve;
  });
  await page.route(/readiness-width=/, async (route) => {
    requested();
    await held;
    await route.fulfill({ status: 404, body: "Cancelled artwork" });
  });
  try {
    await page.locator(".site-brand").click();
    await seen;
    await page.locator('.desktop-links a[href="/#projects"]').click();
    await expect(page.locator("#projects h2")).toHaveText("Projects");
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
  await page.waitForTimeout(900);
  await expect(page).toHaveURL("/#projects");
  await page
    .locator('a.project-card[href="/projects/library-management"]')
    .click();
  await expect(page.locator("#main-content h1")).toHaveText(
    "Library Management System",
  );
  await page.locator(".site-brand").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/");
  await expect(page.locator("body[data-field-map]")).toHaveCount(1);
  await page.goBack();
  await expect(page.locator("#main-content h1")).toHaveText(
    "Library Management System",
  );
  await page.goForward();
  await expect(page.locator("body[data-field-map]")).toHaveCount(1);
});

test("repeated CPU-throttled swaps never capture the fallback", async ({
  page,
  context,
}) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/");
  await captureFirstPaint(page);
  for (let visit = 0; visit < 3; visit++) {
    await page
      .locator('a.project-card[href="/projects/library-management"]')
      .click();
    await expect(page.locator("#main-content h1")).toHaveText(
      "Library Management System",
    );
    await page.locator(".site-brand").click();
    await expect(page.locator("body[data-field-map]")).toHaveCount(1);
  }
  await expect.poll(() => paints(page)).toHaveLength(6);
  expect((await paints(page)).every((paint) => !paint.covered)).toBe(true);
  await cdp.detach();
});
