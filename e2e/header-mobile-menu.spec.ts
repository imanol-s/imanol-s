import { expect, test, type Page } from "@playwright/test";

async function waitForHeader(page: Page) {
  await expect
    .poll(() =>
      page
        .locator(".site-header")
        .evaluate((header) =>
          (header as HTMLElement).style.getPropertyValue(
            "--header-expanded-width",
          ),
        ),
    )
    .not.toBe("");
}

async function captureNextViewTransition(page: Page) {
  await page.evaluate(() => {
    const target = window as Window & {
      __nextAstroTransitionFinished?: Promise<void>;
    };
    target.__nextAstroTransitionFinished = new Promise((resolve) => {
      document.addEventListener(
        "astro:before-swap",
        (event) => {
          const transition = (
            event as Event & {
              viewTransition?: { finished: Promise<unknown> };
            }
          ).viewTransition;
          if (transition) {
            void transition.finished.then(
              () => resolve(),
              () => resolve(),
            );
          } else {
            document.addEventListener("astro:page-load", () => resolve(), {
              once: true,
            });
          }
        },
        { once: true },
      );
    });
  });
}

async function waitForViewTransition(page: Page) {
  await page.evaluate(() => {
    const target = window as Window & {
      __nextAstroTransitionFinished?: Promise<void>;
    };
    return target.__nextAstroTransitionFinished;
  });
}

async function expandDockedHeader(page: Page) {
  const header = page.locator(".site-header");
  if ((await header.getAttribute("data-header-docked")) !== null) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
}

async function expectMenuIcon(page: Page, open: boolean) {
  const button = page.locator("#mobile-menu-btn");
  await expect(button).toHaveAttribute("aria-expanded", String(open));
  await expect(button).toHaveAttribute(
    "aria-label",
    open ? "Close menu" : "Open menu",
  );
  await expect(
    button.locator(open ? ".menu-close" : ".menu-bars"),
  ).toBeVisible();
  await expect(
    button.locator(open ? ".menu-bars" : ".menu-close"),
  ).toBeHidden();
}

async function expectSeparatePanel(page: Page, width: number) {
  const surface = await page.locator(".header-surface").boundingBox();
  const panel = await page.locator("#mobile-menu").boundingBox();
  expect(surface).not.toBeNull();
  expect(panel).not.toBeNull();
  expect(panel!.y - (surface!.y + surface!.height)).toBeGreaterThanOrEqual(8);
  expect(panel!.x).toBe(surface!.x);
  expect(panel!.width).toBe(surface!.width);
  expect(panel!.x).toBeGreaterThanOrEqual(16);
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(width - 16);
  expect(surface!.height).toBe(56);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    width,
  );
  for (const link of await page.locator("#mobile-menu a").all()) {
    await expect(link).toBeVisible();
    const target = await link.boundingBox();
    expect(target!.height).toBeGreaterThanOrEqual(44);
    expect(target!.width).toBeGreaterThanOrEqual(44);
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

for (const width of [320, 390, 596]) {
  test(`mobile menu clears the floating capsule at ${width}px, including after docking`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await waitForHeader(page);
    const header = page.locator(".site-header");
    const menuButton = page.locator("#mobile-menu-btn");
    await expectMenuIcon(page, false);
    await menuButton.click();
    await expectMenuIcon(page, true);
    await expectSeparatePanel(page, width);
    await page.evaluate(() =>
      window.scrollTo({ top: 500, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await expectSeparatePanel(page, width);
    await menuButton.click();
    await menuButton.evaluate((button) => (button as HTMLElement).blur());
    await page.evaluate(() =>
      window.scrollTo({ top: 800, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-docked", "");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await menuButton.click();
    await expectMenuIcon(page, true);
    await expectSeparatePanel(page, width);
  });
}

test("mobile menu preserves keyboard, route and desktop-resize behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await waitForHeader(page);
  const button = page.locator("#mobile-menu-btn");
  const panel = page.locator("#mobile-menu");
  await button.click();
  await page.keyboard.press("Tab");
  await expect(
    panel.getByRole("link", { name: "WORK", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    panel.getByRole("link", { name: "EXPERIENCE", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: /RESUME/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();
  await expectMenuIcon(page, false);
  await button.click();
  await expect(
    panel.getByRole("link", { name: "WORK", exact: true }),
  ).toHaveAttribute("href", "/#projects");
  await panel.getByRole("link", { name: "WORK", exact: true }).click();
  await expect(page).toHaveURL("/#projects");
  await expect(page.locator("#projects h2")).toBeInViewport();
  await waitForHeader(page);
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await captureNextViewTransition(page);
  await page
    .locator('a.project-card[href="/projects/library-management"]')
    .click();
  await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
  await waitForViewTransition(page);
  await waitForHeader(page);
  await expandDockedHeader(page);
  await button.click();
  await captureNextViewTransition(page);
  await panel.getByRole("link", { name: "WORK", exact: true }).click();
  await expect(page).toHaveURL("/#projects");
  await waitForViewTransition(page);
  await expect(page.locator("#projects h2")).toBeInViewport();
  await waitForHeader(page);
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".site-header")).toHaveAttribute(
    "data-header-docked",
    "",
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  await button.click();
  await expectMenuIcon(page, true);
  await expectSeparatePanel(page, 390);
  await panel.getByRole("link", { name: "WORK", exact: true }).focus();
  await expect(
    panel.getByRole("link", { name: "WORK", exact: true }),
  ).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(panel).toBeHidden();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".site-brand")).toBeFocused();
  await expect(page.locator(".desktop-links")).toBeVisible();
  const surface = await page.locator(".header-surface").boundingBox();
  expect(surface).toEqual({ x: 160, y: 12, width: 960, height: 56 });
});

test("mobile navigation remains separated and usable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 320, height: 844 },
  });
  const page = await context.newPage();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expectSeparatePanel(page, width);
    await expect(
      page
        .locator("#mobile-menu")
        .getByRole("link", { name: "WORK", exact: true }),
    ).toHaveAttribute("href", "/#projects");
  }
  await context.close();
});
