import { expect, test, type Page } from "@playwright/test";

const waitForHeader = async (page: Page, width: number) => {
  const expandedWidth = Math.min(960, width - (width < 768 ? 32 : 48));
  const header = page.locator(".site-header");
  await expect
    .poll(() =>
      header.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue(
          "--header-expanded-width",
        ),
      ),
    )
    .toBe(`${expandedWidth}px`);
  await expect
    .poll(() =>
      header.evaluate((element) =>
        Math.round(element.getBoundingClientRect().width),
      ),
    )
    .toBe(expandedWidth);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return header;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

for (const width of [1280, 800, 390, 320]) {
  test(`frog stays anchored while navigation tucks away at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const header = await waitForHeader(page, width);
    const motion = await page.evaluate(async () => {
      const shell = document.querySelector(".site-header")!;
      const frog = document.querySelector(".header-frog")!;
      const end = document.querySelector(".header-end")!;
      const link = document.querySelector(".site-brand")!;
      const initial = shell.getBoundingClientRect().width;
      const textBounds = link.getBoundingClientRect();
      const frogX = frog.getBoundingClientRect().x;
      const widths: number[] = [];
      const frogXs: number[] = [];
      const layoutWidths: number[] = [];
      const textSizes: Array<{ width: number; height: number }> = [];
      // Capture and seek real CSS transitions so a busy frame cannot skip the intermediate geometry.
      const transitions = await new Promise<CSSTransition[]>((resolve) => {
        const observer = new MutationObserver(() => {
          if (!shell.hasAttribute("data-header-docked")) return;
          observer.disconnect();
          getComputedStyle(end).transform;
          const active = shell
            .getAnimations({ subtree: true })
            .filter(
              (animation): animation is CSSTransition =>
                animation instanceof CSSTransition,
            );
          active.forEach((animation) => animation.pause());
          resolve(active);
        });
        observer.observe(shell, {
          attributes: true,
          attributeFilter: ["data-header-docked"],
        });
        window.scrollTo({ top: 800, behavior: "instant" });
      });
      await Promise.all(transitions.map((animation) => animation.ready));
      const transformTargets = transitions
        .filter((animation) => animation.transitionProperty === "transform")
        .map((animation) =>
          (animation.effect as KeyframeEffect).target === end
            ? "end"
            : (animation.effect as KeyframeEffect).target ===
                document.querySelector(".header-rail")
              ? "rail"
              : "unexpected",
        )
        .sort();
      for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
        for (const animation of transitions) {
          const timing = animation.effect!.getComputedTiming();
          animation.currentTime =
            Number(timing.delay) + Number(timing.duration) * progress;
        }
        widths.push(
          end.getBoundingClientRect().right -
            shell.getBoundingClientRect().left,
        );
        layoutWidths.push(shell.getBoundingClientRect().width);
        const text = link.getBoundingClientRect();
        textSizes.push({ width: text.width, height: text.height });
        frogXs.push(frog.getBoundingClientRect().x);
      }
      transitions.forEach((animation) => animation.finish());
      return {
        transformTargets,
        initial,
        frogX,
        widths,
        frogXs,
        layoutWidths,
        textSizes,
        textBounds: { width: textBounds.width, height: textBounds.height },
      };
    });
    expect(motion.transformTargets).toEqual(["end", "rail"]);
    expect(
      motion.widths.some(
        (sample) => sample > 76 && sample < motion.initial - 20,
      ),
    ).toBe(true);
    expect(motion.frogXs.every((x) => Math.abs(x - motion.frogX) < 0.5)).toBe(
      true,
    );
    expect(
      motion.layoutWidths.every(
        (sample) => Math.abs(sample - motion.initial) < 0.5,
      ),
    ).toBe(true);
    expect(
      motion.textSizes.every(
        (sample) =>
          Math.abs(sample.width - motion.textBounds.width) < 0.5 &&
          Math.abs(sample.height - motion.textBounds.height) < 0.5,
      ),
    ).toBe(true);
    const button = page.getByRole("button", { name: "Open navigation" });
    await expect(header).toHaveAttribute("data-header-docked", "");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect
      .poll(() =>
        header.evaluate((element) =>
          Math.round(
            element.querySelector(".header-end")!.getBoundingClientRect()
              .right - element.getBoundingClientRect().left,
          ),
        ),
      )
      .toBe(56);
    await expect(page.locator("#header-navigation")).toHaveJSProperty(
      "inert",
      true,
    );
    const bounds = await header.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    const target = await button.boundingBox();
    expect(target!.width).toBe(56);
    expect(target!.height).toBe(56);
    expect(
      await header.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return element.contains(
          document.elementFromPoint(rect.left + 100, rect.top + 28),
        );
      }),
    ).toBe(false);
    await button.click();
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await expect(page.locator(".site-brand")).toBeFocused();
    await expect(page.locator("#header-navigation")).toHaveJSProperty(
      "inert",
      false,
    );
    await page
      .locator(".site-brand")
      .evaluate((element) => (element as HTMLElement).blur());
    await page.mouse.wheel(0, 200);
    await expect(header).toHaveAttribute("data-header-docked", "");
    await page.mouse.wheel(0, -100);
    await expect(header).not.toHaveAttribute("data-header-docked", "");
  });
}

test("keyboard focus keeps navigation expanded", async ({ page }) => {
  await page.goto("/");
  const header = await waitForHeader(page, 1280);
  await page.locator(".site-brand").focus();
  await page.mouse.wheel(0, 800);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100);
  await expect(header).not.toHaveAttribute("data-header-docked", "");
  await expect(page.locator("#header-navigation")).toHaveJSProperty(
    "inert",
    false,
  );
});

test("open mobile menu stays expanded and Escape returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const header = await waitForHeader(page, 390);
  const menu = page.getByRole("button", { name: "Open menu" });
  await menu.click();
  await page.mouse.wheel(0, 800);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100);
  await expect(header).not.toHaveAttribute("data-header-docked", "");
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#mobile-menu")).not.toBeVisible();
});

test("reduced motion keeps the dock accessible without animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const header = await waitForHeader(page, 1280);
  await page.mouse.wheel(0, 800);
  const button = page.getByRole("button", { name: "Open navigation" });
  await expect(button).toBeVisible();
  await button.focus();
  await page.keyboard.press("Enter");
  const expanded = await page.evaluate(
    () =>
      new Promise<{ width: number; opacity: string }>((resolve) => {
        requestAnimationFrame(() =>
          resolve({
            width: Math.round(
              document.querySelector(".header-end")!.getBoundingClientRect()
                .right -
                document.querySelector(".site-header")!.getBoundingClientRect()
                  .left,
            ),
            opacity: getComputedStyle(
              document.querySelector("#header-navigation")!,
            ).opacity,
          }),
        );
      }),
  );
  expect(expanded).toEqual({ width: 960, opacity: "1" });
  await expect(page.locator(".site-brand")).toBeFocused();
  await expect(header).not.toHaveAttribute("data-header-docked", "");
  await expect(page.locator(".header-frog svg")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("resizing a docked header updates its anchor without exposing links", async ({
  page,
}) => {
  await page.goto("/");
  const header = await waitForHeader(page, 1280);
  await page.mouse.wheel(0, 800);
  await expect(header).toHaveAttribute("data-header-docked", "");
  await page.setViewportSize({ width: 390, height: 800 });
  await expect
    .poll(() =>
      header.evaluate((element) =>
        Math.round(element.getBoundingClientRect().left),
      ),
    )
    .toBe(16);
  await expect(page.locator("#header-navigation")).toHaveJSProperty(
    "inert",
    true,
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect
    .poll(() =>
      header.evaluate((element) =>
        Math.round(element.getBoundingClientRect().width),
      ),
    )
    .toBe(358);
});

test("Astro navigation initializes a fresh working header", async ({
  page,
}) => {
  await page.goto("/");
  await waitForHeader(page, 1280);
  await page
    .locator('a.project-card[href="/projects/library-management"]')
    .click();
  await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
  await page.getByRole("link", { name: "All projects", exact: true }).click();
  await expect(page).toHaveURL("/#projects");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const header = await waitForHeader(page, 1280);
  await page.mouse.wheel(0, 800);
  await expect(header).toHaveAttribute("data-header-docked", "");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(header).not.toHaveAttribute("data-header-docked", "");
});

test("navigation has a visible fallback without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".site-brand")).toBeVisible();
  await expect(page.locator("#mobile-menu a[href='/#projects']")).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await context.close();
});
