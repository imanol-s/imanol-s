import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`frog dock stays centered and opens navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const expandedWidth = Math.min(760, width - (width < 768 ? 32 : 48));
    await expect.poll(() => page.locator(".site-header").evaluate(element => (element as HTMLElement).style.getPropertyValue("--header-expanded-width"))).toBe(`${expandedWidth}px`);
    await expect.poll(() => page.locator(".site-header").evaluate(element => element.getBoundingClientRect().width)).toBe(expandedWidth);
    const widths = await page.evaluate(async () => {
      const shell = document.querySelector(".site-header")!;
      const initial = shell.getBoundingClientRect().width;
      const samples: number[] = [];
      window.scrollTo({ top: 800, behavior: "instant" });
      const start = performance.now();
      while (performance.now() - start < 700) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        samples.push(shell.getBoundingClientRect().width);
      }
      return { initial, samples };
    });
    expect(widths.samples.some(sample => sample > 76 && sample < widths.initial - 20)).toBe(true);
    const header = page.locator(".site-header");
    const button = page.getByRole("button", { name: "Open navigation" });
    await expect(header).toHaveAttribute("data-header-docked", "");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect.poll(() => header.evaluate(element => Math.round(element.getBoundingClientRect().width))).toBe(56);
    const bounds = await header.boundingBox();
    expect(bounds!.x + bounds!.width / 2).toBe(width / 2);
    await expect(page.locator("#header-navigation")).toHaveJSProperty("inert", true);
    await button.click();
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await expect(page.locator(".site-brand")).toBeFocused();
    await expect(page.locator("#header-navigation")).toHaveJSProperty("inert", false);
    await page.locator(".site-brand").evaluate(element => (element as HTMLElement).blur());
    await page.mouse.wheel(0, 200);
    await expect(header).toHaveAttribute("data-header-docked", "");
    await page.mouse.wheel(0, -100);
    await expect(header).not.toHaveAttribute("data-header-docked", "");
  });
}

test("reduced motion keeps the frog dock accessible without animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.mouse.wheel(0, 800);
  const button = page.getByRole("button", { name: "Open navigation" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".site-brand")).toBeFocused();
  await expect(page.locator(".site-header")).not.toHaveAttribute("data-header-docked", "");
  await expect(page.locator(".header-frog svg")).toHaveCSS("animation-name", "none");
});
