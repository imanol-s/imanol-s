import { test, expect } from "@playwright/test";
import { ME } from "../src/config";

type MotionWindow = Window & {
  topoNode: HTMLElement | null;
};

test("server-rendered name is complete and the hero action works without JavaScript", async ({
  page,
}) => {
  await page.route(/\/_astro\/.*\.js(?:\?|$)/, (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".hero-name h1")).toHaveText(ME.name);
  const action = page.getByRole("link", { name: /Explore my work/ });
  await expect(action).toBeVisible();
  await action.click();
  await expect(page).toHaveURL(/#projects$/);
});

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
    await expect(background.locator("feTurbulence")).toHaveAttribute(
      "seed",
      /\d+/,
    );
    await background.evaluate((element) => {
      (window as unknown as MotionWindow).topoNode = element as HTMLElement;
    });
    const snapshot = () =>
      background.evaluate((element) => ({
        sameNode: element === (window as unknown as MotionWindow).topoNode,
        transform: (element as HTMLElement).style.transform,
        frequency: element
          .querySelector("feTurbulence")
          ?.getAttribute("baseFrequency"),
        seed: element.querySelector("feTurbulence")?.getAttribute("seed"),
      }));
    const before = await snapshot();
    expect(before.transform).toBe("");
    expect(before.frequency).toBe("0.002");
    await page.waitForTimeout(350);
    expect(await snapshot()).toEqual(before);

    await page
      .locator('a.project-card[href="/projects/library-management"]')
      .click();
    await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
    await expect(page.locator("body")).not.toHaveAttribute("data-field-map");
    if (reducedMotion === "no-preference") {
      await expect
        .poll(async () => (await snapshot()).transform)
        .toContain("translate(");
    }
    const after = await snapshot();
    expect(after.sameNode).toBe(true);
    expect(after.seed).toBe(before.seed);
    if (reducedMotion === "reduce") {
      expect(after).toEqual(before);
    } else {
      expect(after.frequency).not.toBe(before.frequency);
    }

    await page
      .locator('.project-pagination a[href="/projects/crime-analysis"]')
      .click();
    await expect(page).toHaveURL(/\/projects\/crime-analysis\/?$/);
    if (reducedMotion === "no-preference") {
      await expect
        .poll(async () => (await snapshot()).transform)
        .not.toBe(after.transform);
    }
    const detail = await snapshot();
    expect(detail.sameNode).toBe(true);
    expect(detail.seed).toBe(before.seed);
    if (reducedMotion === "reduce") {
      expect(detail).toEqual(before);
    } else {
      const translation = (transform: string) =>
        Number(transform.match(/translate\(([-\d.]+)%/)?.[1]);
      expect(translation(detail.transform)).toBeLessThan(
        translation(after.transform),
      );
    }

    await page.locator('header a[href="/"]:visible').first().click();
    await expect(page).toHaveURL("/");
    await expect(page.locator("body")).toHaveAttribute("data-field-map");
    const hiddenAgain = await snapshot();
    expect(hiddenAgain.sameNode).toBe(true);
    expect(hiddenAgain.seed).toBe(before.seed);
    await page.waitForTimeout(350);
    expect(await snapshot()).toEqual(hiddenAgain);
  });
}
