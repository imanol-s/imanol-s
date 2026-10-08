import { test, expect } from "@playwright/test";

type MotionWindow = Window & {
  nameSamples: string[];
  topoNode: HTMLElement | null;
};

for (const width of [1280, 390]) {
  test(`first-visit name reveal never clears during overlay fading at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      sessionStorage.removeItem("site-lifecycle-ready");
      const browser = window as unknown as MotionWindow;
      browser.nameSamples = [];
      const start = performance.now();
      const sample = () => {
        const output = document.querySelector("[data-typewriter-output]");
        const overlay = document.querySelector("[data-loading-overlay]");
        const fallback = document.getElementById("loading-overlay");
        const revealed =
          overlay?.getAttribute("data-loading-overlay") === "overlay-fading" ||
          (!overlay && fallback?.style.display === "none");
        if (output && revealed)
          browser.nameSamples.push(output.textContent ?? "");
        if (performance.now() - start < 4000) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto("/");
    const fullName = await page.locator("h1").getAttribute("aria-label");
    expect(fullName).toBeTruthy();
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as unknown as MotionWindow).nameSamples.at(-1),
        ),
      )
      .toBe(fullName);
    await expect(page.locator("[data-typewriter-output]")).toHaveText(
      fullName!,
    );
    const samples = await page.evaluate(
      () => (window as unknown as MotionWindow).nameSamples,
    );
    expect(
      samples.some(
        (sample) => sample.length > 0 && sample.length < fullName!.length,
      ),
    ).toBe(true);
    expect(
      samples.every(
        (sample, index) =>
          fullName!.startsWith(sample) &&
          (!index || sample.length >= samples[index - 1].length),
      ),
    ).toBe(true);
  });
}

test("Back to top keeps its outlined hit target while overlapping the desktop sidebar", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.locator("#profile-sidebar").evaluate((sidebar) => {
    const bottom = sidebar.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({
      top: bottom - window.innerHeight + 32,
      behavior: "instant",
    });
  });
  const button = page.getByRole("button", { name: "Back to top" });
  await expect(button).toBeVisible();
  const shape = await button.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const sidebar = document
      .getElementById("profile-sidebar")!
      .getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      outlined: Number.parseFloat(getComputedStyle(element).borderTopWidth) > 0,
      overlapping: sidebar.top < rect.bottom && sidebar.bottom > rect.top,
    };
  });
  expect(shape.overlapping).toBe(true);
  expect(shape.width).toBeGreaterThanOrEqual(44);
  expect(shape.height).toBeGreaterThanOrEqual(44);
  expect(shape.outlined).toBe(true);
  await button.click();
  await expect(page.locator("#main-content")).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`topography persists across Astro navigation with ${reducedMotion} motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() =>
      sessionStorage.setItem("site-lifecycle-ready", "true"),
    );
    await page.goto("/");
    const background = page.locator("[data-topo-background]");
    await expect(background).toBeAttached();
    if (reducedMotion === "no-preference") {
      await expect
        .poll(() =>
          background.evaluate(
            (element) => (element as HTMLElement).style.transform,
          ),
        )
        .toContain("translate(");
    }
    const before = await background.evaluate((element) => {
      (window as unknown as MotionWindow).topoNode = element as HTMLElement;
      return {
        transform: (element as HTMLElement).style.transform,
        frequency: element
          .querySelector("feTurbulence")
          ?.getAttribute("baseFrequency"),
      };
    });
    await page.locator('.desktop-links a[href="/projects"]').click();
    await expect(page).toHaveURL(/\/projects\/?$/);
    const after = await page.evaluate(() => {
      const element = document.querySelector<HTMLElement>(
        "[data-topo-background]",
      )!;
      return {
        sameNode: element === (window as unknown as MotionWindow).topoNode,
        transform: element.style.transform,
        frequency: element
          .querySelector("feTurbulence")
          ?.getAttribute("baseFrequency"),
      };
    });
    expect(after.sameNode).toBe(true);
    if (reducedMotion === "reduce") {
      expect(after.transform).toBe(before.transform);
      expect(after.frequency).toBe(before.frequency);
    } else {
      const translation = (transform: string) =>
        Number(transform.match(/translate\(([-\d.]+)%/)?.[1]);
      expect(translation(after.transform)).toBeLessThan(
        translation(before.transform),
      );
    }
  });
}
