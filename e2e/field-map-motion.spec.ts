import { test, expect, type Page } from "@playwright/test";

const TRAIL = "#field-map-trail-path";
const INK = "#field-map-trail-ink";

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(TRAIL)).toHaveAttribute("d", /.+/);
}

/** Fraction of the trail the ink has drawn, from 0 to 1. */
const drawn = (page: Page) =>
  page.locator(INK).evaluate((el: SVGPathElement) => {
    const total = parseFloat(el.style.strokeDasharray);
    const offset = parseFloat(getComputedStyle(el).strokeDashoffset);
    return total ? 1 - offset / total : 0;
  });

const cloudStates = (page: Page) =>
  page
    .locator(".field-map-clouds")
    .evaluate((el) =>
      el.getAnimations({ subtree: true }).map((a) => a.playState),
    );

// Catches: ink drawn all at once, never finishing, or not masking the trail.
test("trail ink draws as sections scroll in and completes at contact", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page);
  await expect(page.locator(TRAIL)).toHaveAttribute(
    "mask",
    "url(#field-map-trail-reveal)",
  );
  await expect.poll(() => drawn(page)).toBeGreaterThan(0);
  expect(await drawn(page)).toBeLessThan(0.99);
  await page.locator("footer#contact").scrollIntoViewIfNeeded();
  await expect.poll(() => drawn(page), { timeout: 5000 }).toBeGreaterThan(0.99);
});

// Catches: clouds or ink ignoring the scenery pause button.
test("pause holds the clouds and the trail ink until play", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page);
  const states = await cloudStates(page);
  expect(states).toHaveLength(2);
  expect(states.every((s) => s === "running")).toBe(true);

  await page.getByRole("button", { name: "Pause scenery animation" }).click();
  expect((await cloudStates(page)).every((s) => s === "paused")).toBe(true);
  const held = await drawn(page);
  await page.setViewportSize({ width: 1280, height: 1000 });
  await expect.poll(() => drawn(page)).toBeCloseTo(held, 3);
  await page.locator("footer#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(await drawn(page)).toBeCloseTo(held, 3);

  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole("button", { name: "Play scenery animation" }).click();
  await expect.poll(() => drawn(page), { timeout: 5000 }).toBeGreaterThan(0.99);
  expect((await cloudStates(page)).every((s) => s === "running")).toBe(true);
});

// Catches: motion running for reduced-motion users or the trail left partly drawn.
test("reduced motion shows still clouds and the whole trail", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await expect(page.locator(TRAIL)).not.toHaveAttribute("mask", /.*/);
  expect(await cloudStates(page)).toHaveLength(0);
});

// Catches: section observers piling up across view transitions.
test("navigating away and back leaves one trail ink observer", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const live = new Set<IntersectionObserver>();
    (window as unknown as { inkObservers: () => number }).inkObservers = () =>
      live.size;
    const Native = window.IntersectionObserver;
    window.IntersectionObserver = class extends Native {
      observe(target: Element) {
        if (target.id === "contact") live.add(this);
        super.observe(target);
      }
      unobserve(target: Element) {
        if (target.id === "contact") live.delete(this);
        super.unobserve(target);
      }
      disconnect() {
        live.delete(this);
        super.disconnect();
      }
    };
  });
  const count = () =>
    page.evaluate(() =>
      (window as unknown as { inkObservers: () => number }).inkObservers(),
    );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page);
  expect(await count()).toBe(1);
  await page
    .locator('a.project-card[href="/projects/library-management"]')
    .click();
  await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
  expect(await count()).toBe(0);
  await page.goBack();
  await expect(page.locator(TRAIL)).toHaveAttribute("mask", /.+/);
  expect(await count()).toBe(1);
});
