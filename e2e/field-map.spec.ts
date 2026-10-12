import { test, expect, type Page } from "@playwright/test";

const TRAIL = "#field-map-trail-path";

async function seekScene(page: Page, seconds: number) {
  const count = await page.locator(".forest-art").evaluate((svg, time) => {
    const animations = svg.getAnimations({ subtree: true });
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = time * 1000;
    }
    return animations.length;
  }, seconds);
  expect(count).toBeGreaterThan(0);
}

async function open(page: Page, width: number, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator(TRAIL)).toHaveAttribute("d", /.+/);
}

/** Trail endpoints and samples in page coordinates, plus independent anchors. */
async function trailGeometry(page: Page) {
  return page.evaluate((sel) => {
    const path = document.querySelector<SVGPathElement>(sel)!;
    const svg = path.ownerSVGElement!;
    const r = svg.getBoundingClientRect();
    const ox = r.left + scrollX;
    const oy = r.top + scrollY;
    const total = path.getTotalLength();
    const sample = (l: number) => {
      const p = path.getPointAtLength(l);
      return { x: p.x + ox, y: p.y + oy };
    };
    const xs: number[] = [];
    for (let l = 0; l <= total; l += 8) xs.push(sample(l).x);
    xs.push(sample(total).x);

    const logs = [...document.querySelectorAll(".forest-art .campfire > path")];
    let l = Infinity,
      t = Infinity,
      rr = -Infinity,
      b = -Infinity;
    for (const el of logs) {
      const q = el.getBoundingClientRect();
      l = Math.min(l, q.left);
      t = Math.min(t, q.top);
      rr = Math.max(rr, q.right);
      b = Math.max(b, q.bottom);
    }
    const main = document.querySelector("#main-content")!;
    const mr = main.getBoundingClientRect();
    const cs = getComputedStyle(main);
    return {
      total,
      start: sample(0),
      end: sample(total),
      xs,
      logCount: logs.length,
      logs: { x: (l + rr) / 2 + scrollX, y: (t + b) / 2 + scrollY },
      contactTop:
        document.querySelector("footer#contact")!.getBoundingClientRect().top +
        scrollY,
      mainContentRight:
        mr.right -
        parseFloat(cs.paddingRight) -
        parseFloat(cs.borderRightWidth),
      clientWidth: document.documentElement.clientWidth,
    };
  }, TRAIL);
}

async function expectTrailAnchored(page: Page) {
  const g = await trailGeometry(page);
  expect(g.total).toBeGreaterThan(100);
  expect(g.logCount).toBeGreaterThan(0);
  expect(Math.abs(g.start.x - g.logs.x)).toBeLessThan(40);
  expect(Math.abs(g.start.y - g.logs.y)).toBeLessThan(40);
  expect(Math.abs(g.end.y - g.contactTop)).toBeLessThan(40);
  expect(g.end.x).toBeGreaterThan(g.mainContentRight);
  expect(g.xs.length).toBeGreaterThan(10);
  expect(Math.min(...g.xs)).toBeGreaterThanOrEqual(0);
  expect(Math.max(...g.xs)).toBeLessThanOrEqual(g.clientWidth);
}

const FIRE_BASELINE = [
  { width: 1440, x: 762.04, y: 364.34, w: 15.22, h: 21.99 },
  // y was 831.21 before the hero excerpt above the stacked scene was removed.
  { width: 390, x: 283.87, y: 618.43, w: 9.35, h: 13.51 },
];

for (const b of FIRE_BASELINE) {
  // Catches: terrain layer/wrapper shifting or resizing the ForestScene, moving the fire.
  test(`fire geometry matches pre-change baseline at ${b.width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await open(page, b.width);
    await seekScene(page, 55);
    await page.evaluate(() => scrollTo(0, 0));
    const r = await page.locator(".campfire").evaluate((el) => {
      const q = el.getBoundingClientRect();
      return { x: q.x, y: q.y, w: q.width, h: q.height };
    });
    expect(Math.abs(r.x - b.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.y - b.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.w - b.w)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.h - b.h)).toBeLessThanOrEqual(1);
  });
}

for (const width of [1440, 900, 390]) {
  // Catches: trail detached from camp/contact, behind content, or outside the page.
  test(`trail runs camp to contact inside the page at ${width}px`, async ({
    page,
  }) => {
    await open(page, width);
    await expectTrailAnchored(page);
  });
}

// Catches: stale viewport coordinates after resize (trail not re-measured).
test("trail re-anchors after resizing 1440 -> 390 -> 1024", async ({
  page,
}) => {
  await open(page, 1440);
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  await expect(async () => {
    await expectTrailAnchored(page);
  }).toPass({ timeout: 5000 });
});

// Catches: duplicate paths on navigation, topo layer not suppressed/restored, scenery leaking to other routes.
test("navigating to /projects and back keeps one trail and restores route backgrounds", async ({
  page,
}) => {
  await open(page, 1440);
  await expect(page.locator("body")).toHaveAttribute("data-field-map", /.*/);
  const topoVisibility = () =>
    page
      .locator(".topo-layer")
      .evaluate((el) => getComputedStyle(el).visibility);
  expect(await page.locator(".topo-layer").count()).toBe(1);
  expect(await topoVisibility()).toBe("hidden");

  await page.locator('header a[href="/projects"]:visible').first().click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expect(page.locator("body")).not.toHaveAttribute(
    "data-field-map",
    /.*/,
  );
  await expect(page.locator(".field-map-scenery")).toHaveCount(0);
  expect(await page.locator(".topo-layer").count()).toBe(1);
  expect(await topoVisibility()).not.toBe("hidden");

  await page.goBack();
  await expect(page).toHaveURL(/localhost:4322\/$/);
  await expect(page.locator(TRAIL)).toHaveCount(1);
  await expect(page.locator(TRAIL)).toHaveAttribute("d", /.+/);
  await expect(page.locator("body")).toHaveAttribute("data-field-map", /.*/);
  expect(await topoVisibility()).toBe("hidden");
  await expect(async () => {
    await expectTrailAnchored(page);
  }).toPass({ timeout: 5000 });
});

// Catches: grid ratio/gap lost above 900px.
test("experience and supporting columns sit side by side at 1440px", async ({
  page,
}) => {
  await open(page, 1440);
  const [e, s] = await Promise.all([
    page.locator("#experience").boundingBox(),
    page.locator(".field-map-supporting").boundingBox(),
  ]);
  expect(e).not.toBeNull();
  expect(s).not.toBeNull();
  expect(s!.x).toBeGreaterThan(e!.x + e!.width);
  expect(Math.abs(s!.y - e!.y)).toBeLessThan(60);
  const ratio = e!.width / s!.width;
  expect(ratio).toBeGreaterThan(1.5);
  expect(ratio).toBeLessThan(1.9);
});

for (const width of [900, 834]) {
  // Catches: wrong stacking order or columns persisting at/below 900px.
  test(`sections stack experience -> approach -> profile at ${width}px`, async ({
    page,
  }) => {
    await open(page, width);
    const boxes = [];
    for (const sel of ["#experience", "#approach", "#profile-sidebar"]) {
      const box = await page.locator(sel).boundingBox();
      expect(box, sel).not.toBeNull();
      boxes.push(box!);
    }
    expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height - 1);
    expect(boxes[2].y).toBeGreaterThanOrEqual(boxes[1].y + boxes[1].height - 1);
  });
}

// Catches: step numbers/icons remaining, or approach items dropped.
test("approach keeps all titled items without step numbers", async ({
  page,
}) => {
  await open(page, 1440);
  const items = await page.locator("#approach .approach-item").count();
  expect(items).toBe(3);
  await expect(page.locator("#approach h3")).toHaveCount(items);
  await expect(page.locator("#approach .step-number")).toHaveCount(0);
});

// Catches: dropped projects or hidden/collapsed career roles.
test("all projects and career highlights are rendered", async ({ page }) => {
  await open(page, 1440);
  await expect(page.locator(".project-card")).toHaveCount(4);
  // Today's fixture counts (src/data/career.ts); update when career content changes.
  const counts = await page
    .locator(".career-entry")
    .evaluateAll((els) =>
      els.map((e) => e.querySelectorAll(".career-highlights li").length),
    );
  expect(counts).toEqual([5, 4, 4, 4]);
});

for (const width of [320, 390, 834, 1440]) {
  // Catches: trail/terrain/contours widening the document.
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await open(page, width);
    const m = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      body: document.body.scrollWidth,
    }));
    expect(m.doc).toBeLessThanOrEqual(m.client);
    expect(m.body).toBeLessThanOrEqual(m.client);
  });
}

// Catches: decorative layer becoming a focus stop, hit target, or exposed to AT; missing/duplicated terrain.
test("decorative scenery is inert and terrain image loads once", async ({
  page,
}) => {
  await open(page, 1440);
  const scenery = page.locator(".field-map-scenery");
  await expect(scenery).toHaveCount(1);
  await expect(scenery).toHaveAttribute("aria-hidden", "true");
  expect(
    await scenery.evaluate((el) => getComputedStyle(el).pointerEvents),
  ).toBe("none");
  const focusable = await scenery.evaluate(
    (el) =>
      el.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable]',
      ).length,
  );
  expect(focusable).toBe(0);
  const terrain = page.locator(".field-map-terrain");
  await expect(terrain).toHaveCount(1);
  expect(
    await terrain.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth,
    ),
  ).toBeGreaterThan(0);
});

for (const width of [1920, 1280, 390]) {
  // Catches: the page below the painting going blank again, or the lower land adding a download.
  test(`lower land runs from the painting to the footer at ${width}px`, async ({
    page,
  }) => {
    const terrain = new Set<string>();
    page.on("request", (r) => {
      if (r.url().includes("field-map-terrain")) terrain.add(r.url());
    });
    await open(page, width);
    const src = await page.locator(".field-map-terrain").getAttribute("src");
    const lower = page.locator(".field-map-scenery .field-map-lower");
    const box = (selector: string) =>
      page.locator(selector).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + scrollY, bottom: r.bottom + scrollY };
      });
    const [painting, ridges, foot, footer] = await Promise.all([
      box(".field-map-terrain"),
      box(".field-map-ridges"),
      box(".field-map-foot"),
      box("footer#contact"),
    ]);
    expect(ridges.top).toBeLessThan(painting.bottom);
    expect(ridges.bottom).toBeCloseTo(footer.bottom, 0);
    expect(foot.bottom).toBeCloseTo(footer.bottom, 0);
    const hrefs = await lower
      .locator("image")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => href === src)).toBe(true);
    expect(terrain.size).toBe(1);
  });
}

for (const [width, shown] of [
  [1440, true],
  [1024, true],
  [834, true],
  [390, false],
] as const) {
  // Catches: camp drawn on the terrain's peak, the ground layer adding a download, or ground behind stacked hero links.
  test(`camp ground ${shown ? "sits under" : "is hidden from"} the camp at ${width}px`, async ({
    page,
  }) => {
    const terrain = new Set<string>();
    page.on("request", (r) => {
      if (r.url().includes("field-map-terrain")) terrain.add(r.url());
    });
    await open(page, width);
    const ground = page.locator(".camp-ground");
    await expect(ground).toHaveCount(1);
    if (!shown) {
      await expect(ground).toBeHidden();
      return;
    }
    expect(await ground.locator("image").getAttribute("href")).toBe(
      await page.locator(".field-map-terrain").getAttribute("src"),
    );
    expect(terrain.size).toBe(1);
    const [g, fire] = await Promise.all([
      ground.boundingBox(),
      page.locator(".campfire").boundingBox(),
    ]);
    expect(fire!.x).toBeGreaterThan(g!.x);
    expect(fire!.x + fire!.width).toBeLessThan(g!.x + g!.width);
  });
}

for (const [width, shown] of [
  [1920, false],
  [1600, true],
  [1440, true],
  [1280, true],
  [1200, true],
  [1024, false],
  [390, false],
] as const) {
  // Catches: lake drawn under the portrait, trail or project cards, or adding a download.
  test(`terrain lake is ${shown ? "clear of portrait, trail and cards" : "hidden"} at ${width}px`, async ({
    page,
  }) => {
    const terrain = new Set<string>();
    page.on("request", (r) => {
      if (r.url().includes("field-map-terrain")) terrain.add(r.url());
    });
    await open(page, width);
    const additions = page.locator(
      ".field-map-scenery .field-map-additions svg",
    );
    const lake = additions.locator(".field-map-lake");
    await expect(lake).toHaveCount(1);
    if (!shown) {
      await expect(lake).toBeHidden();
      return;
    }
    await expect(lake).toBeVisible();
    const hits = await additions.evaluate((svg, sel) => {
      const shore = svg.querySelector<SVGPathElement>(".lake-shore")!;
      const box = svg.getBoundingClientRect();
      const scale = 1024 / box.width;
      const inLake = (x: number, y: number) =>
        shore.isPointInFill(
          new DOMPoint((x - box.left) * scale, (y - box.top) * scale),
        );
      const covers = (q: DOMRect) => {
        for (let x = q.left; x <= q.right; x += 4)
          for (let y = q.top; y <= q.bottom; y += 4)
            if (inLake(x, y)) return true;
        return false;
      };
      const found: string[] = [];
      const portrait = document.querySelector(".hero-section img")!;
      if (covers(portrait.getBoundingClientRect())) found.push("portrait");
      for (const card of document.querySelectorAll(".project-card")) {
        if (covers(card.getBoundingClientRect())) found.push("card");
      }
      const path = document.querySelector<SVGPathElement>(sel)!;
      const origin = path.ownerSVGElement!.getBoundingClientRect();
      for (let l = 0; l < path.getTotalLength(); l += 3) {
        const p = path.getPointAtLength(l);
        if (inLake(p.x + origin.left, p.y + origin.top)) {
          found.push("trail");
          break;
        }
      }
      const terrainSrc = document
        .querySelector(".field-map-terrain")!
        .getAttribute("src");
      return {
        found,
        reusesTerrain: [...svg.querySelectorAll("image")].every(
          (img) => img.getAttribute("href") === terrainSrc,
        ),
      };
    }, TRAIL);
    expect(hits.found).toEqual([]);
    expect(hits.reusesTerrain).toBe(true);
    expect(terrain.size).toBe(1);
  });
}
