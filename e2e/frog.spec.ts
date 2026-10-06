import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`frog finishes visible hops after a large scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const frog = page.locator("#scroll-frog");
    await page.mouse.wheel(0, 800);
    await expect(frog).toBeVisible();
    const first = await frog.evaluate((element) => element.style.transform);
    await page.waitForTimeout(300);
    const second = await frog.evaluate((element) => ({ transform: element.style.transform, bounds: element.getBoundingClientRect().toJSON() }));
    expect(second.transform).not.toBe(first);
    expect(second.bounds.top).toBeGreaterThan(0);
    expect(second.bounds.bottom).toBeLessThan(160);
    expect(second.bounds.left).toBeLessThan(width);
    await expect(frog).toBeHidden({ timeout: 2500 });
    await page.mouse.wheel(0, -800);
    await expect(page.locator(".brand-frog")).toBeVisible();
    await page.mouse.wheel(0, 500);
    await expect(frog).toBeVisible();
    await page.mouse.wheel(0, -300);
    await expect(frog).toBeHidden();
    await expect(page.locator(".brand-frog")).toHaveCSS("opacity", "1");
  });
}

test("reduced motion cancels a running hop and prevents new flights", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const frog = page.locator("#scroll-frog");
  await page.mouse.wheel(0, 800);
  await expect(frog).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frog).toBeHidden();
  await page.mouse.wheel(0, -800);
  await page.mouse.wheel(0, 800);
  await expect(frog).toBeHidden();
});
