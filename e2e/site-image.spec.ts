import { test, expect } from "@playwright/test";
import sharp from "sharp";

const sourceFiles = {
  automaton: "../src/assets/projects/automaton.webp",
  "housing-analysis": "../src/assets/projects/housing-analysis.webp",
  library: "../src/assets/projects/library.webp",
  robotics: "../src/assets/projects/robotics.webp",
  "task-scheduling": "../src/assets/projects/task-scheduling.webp",
  "opening-go2w": "../src/assets/project-story/opening-go2w.png",
  "environment-go2w": "../src/assets/project-story/environment-go2w.png",
  crime_analysis_map:
    "../src/content/projects/images/crime-analysis/crime_analysis_map.webp",
};
const sourceWidths = Promise.all(
  Object.entries(sourceFiles).map(async ([name, file]) => {
    const { width } = await sharp(
      new URL(file, import.meta.url).pathname,
    ).metadata();
    expect(width, `${name} original source width`).toBeGreaterThan(0);
    return [name, width!] as const;
  }),
).then((entries) => Object.fromEntries(entries));

const routes = [
  "/",
  "/projects/sensori-robotics",
  "/projects/library-management",
  "/projects/crime-analysis",
  "/projects/automaton",
  "/projects/pert-scheduling",
];

test("content images preserve semantics, dimensions and presentation on every page", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      const images = page.locator(
        ".portrait-image, .project-cover, .project-opening-art img, .environment-figure img, .analysis-map",
      );
      expect(await images.count(), route).toBeGreaterThan(0);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty("complete", true);
        expect(
          await image.evaluate((i: HTMLImageElement) => i.naturalWidth),
        ).toBeGreaterThan(0);
        expect(await image.getAttribute("alt")).not.toBeNull();
        await expect(image).toHaveAttribute("width", /^[1-9]\d*$/);
        await expect(image).toHaveAttribute("height", /^[1-9]\d*$/);
        const info = await image.evaluate((i: HTMLImageElement) => ({
          source: i.currentSrc,
          candidates: i.srcset,
          ratio:
            i.getBoundingClientRect().width / i.getBoundingClientRect().height,
          intrinsic:
            Number(i.getAttribute("width")) / Number(i.getAttribute("height")),
          fit: getComputedStyle(i).objectFit,
          classes: i.className,
        }));
        expect(info.source).toContain("/_astro/");
        expect(info.source).not.toContain(".netlify/images");
        expect(info.candidates).toMatch(/\d+w/);
        if (info.classes.includes("project-cover")) {
          expect(info.ratio).toBeCloseTo(2, 1);
          expect(info.fit).toBe("cover");
          await expect(image).toHaveAttribute("alt", "");
        } else {
          expect(
            (await image.getAttribute("alt"))?.trim().length,
          ).toBeGreaterThan(0);
          expect(info.ratio).toBeCloseTo(info.intrinsic, 1);
        }
      }
      if (route === "/") {
        const portrait = page.locator(".portrait-image");
        expect(
          await portrait.evaluate((i) => getComputedStyle(i).maskImage),
        ).toContain("linear-gradient");
        const preload = page.locator('link[rel="preload"][as="image"]');
        await expect(preload).toHaveCount(1);
        expect(await preload.getAttribute("href")).toBe(
          await portrait.getAttribute("src"),
        );
        expect(await preload.getAttribute("imagesrcset")).toBe(
          await portrait.getAttribute("srcset"),
        );
        expect(await preload.getAttribute("imagesizes")).toBe(
          await portrait.getAttribute("sizes"),
        );
        await expect(portrait).toHaveAttribute("loading", "eager");
        await expect(portrait).toHaveAttribute("fetchpriority", "high");
      }
      if (route.includes("crime-analysis")) {
        await expect(page.locator(".analysis-map")).toHaveAttribute(
          "alt",
          /arrest counts.*not population-adjusted/,
        );
        expect(
          await page
            .locator(".analysis-map")
            .evaluate((i) => getComputedStyle(i).objectFit),
        ).not.toBe("cover");
      }
    }
  }
});

for (const width of [390, 1440])
  for (const density of [1, 2, 3]) {
    test(`responsive candidates at ${width}px and ${density}x`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        deviceScaleFactor: density,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      for (const route of [
        "/",
        "/projects/sensori-robotics",
        "/projects/crime-analysis",
      ]) {
        await page.goto(route);
        const images = page.locator(
          ".project-cover, .project-opening-art img, .environment-figure img, .analysis-map",
        );
        expect(await images.count()).toBeGreaterThan(0);
        for (const image of await images.all()) {
          await image.scrollIntoViewIfNeeded();
          await expect(image).toHaveJSProperty("complete", true);
          const info = await image.evaluate(async (i: HTMLImageElement) => {
            await i.decode();
            const selected = new Image();
            selected.src = i.currentSrc;
            await selected.decode();
            return {
              actual: selected.naturalWidth,
              slot: i.getBoundingClientRect().width,
              candidates: i.srcset,
              source: i.currentSrc,
            };
          });
          const widths = [...info.candidates.matchAll(/ (\d+)w/g)].map((m) =>
            Number(m[1]),
          );
          expect(widths.length).toBeGreaterThan(0);
          if (!info.source.includes("crime_analysis_map"))
            expect(widths.length).toBeGreaterThan(1);
          const sourceName = new URL(info.source).pathname
            .split("/")
            .at(-1)!
            .split(".")[0];
          const originals = await sourceWidths;
          expect(
            originals,
            `known original asset ${sourceName}`,
          ).toHaveProperty(sourceName);
          expect(
            info.actual,
            `${sourceName} selected resolution`,
          ).toBeGreaterThanOrEqual(
            Math.min(
              Math.floor(info.slot * density * 0.85),
              originals[sourceName],
            ),
          );
          expect(info.actual).toBeLessThanOrEqual(
            Math.max(Math.min(...widths), Math.ceil(info.slot * density * 1.7)),
          );
        }
      }
      await context.close();
    });
  }

test("tablet openers cap their responsive size at the displayed 30rem width", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1000, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const route of routes.slice(1)) {
    await page.goto(route);
    const image = page.locator(".project-opening-art img");
    const info = await image.evaluate(async (i: HTMLImageElement) => {
      await i.decode();
      const selected = new Image();
      selected.src = i.currentSrc;
      await selected.decode();
      return {
        slot: i.getBoundingClientRect().width,
        actual: selected.naturalWidth,
      };
    });
    expect(info.slot, route).toBeCloseTo(480, 0);
    expect(info.actual, route).toBe(640);
  }
  await context.close();
});

test("preloads and navigation reuse the selected image without fallback downloads", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "image") requests.push(r.url());
  });
  await page.goto("/");
  await expect(page.locator(".portrait-image")).toHaveJSProperty(
    "complete",
    true,
  );
  const portrait = await page
    .locator(".portrait-image")
    .evaluate((i: HTMLImageElement) => i.currentSrc);
  expect(requests.filter((url) => url === portrait)).toHaveLength(1);
  requests.length = 0;
  await page
    .locator('a.project-card[href="/projects/sensori-robotics"]')
    .click();
  await expect(page.locator(".project-opening-art img")).toHaveJSProperty(
    "complete",
    true,
  );
  const opener = await page
    .locator(".project-opening-art img")
    .evaluate((i: HTMLImageElement) => ({
      src: i.currentSrc,
      fallback: i.src,
      ready: i.naturalWidth > 0,
    }));
  expect(opener.ready).toBe(true);
  expect(requests.filter((url) => url === opener.src)).toHaveLength(1);
  if (opener.src !== opener.fallback)
    expect(requests).not.toContain(opener.fallback);
  await page.locator(".site-brand").click();
  await expect(page.locator(".portrait-image")).toHaveJSProperty(
    "complete",
    true,
  );
  expect(requests.filter((url) => url === portrait)).toHaveLength(0);
});
