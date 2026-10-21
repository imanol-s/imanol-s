import { test, expect, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";

async function assertNamedControls(page: Page): Promise<void> {
  // Opacity-hidden controls can retain a box while intentionally absent from accessibility.
  const controls = page.locator(
    ':is(button,a[href],input:not([type=hidden]),textarea,select,summary):not([aria-hidden="true"], [aria-hidden="true"] *, [inert], [inert] *)',
  );
  await expect(controls).not.toHaveCount(0);
  for (const control of await controls.all()) {
    if (await control.isVisible())
      await expect(control).toHaveAccessibleName(/\S/);
  }
}

const routes = [
  "/",
  "/404/",
  ...readdirSync("src/content/projects")
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => `/projects/${file.replace(/\.mdx$/, "")}/`),
];

test.use({ contextOptions: { reducedMotion: "reduce" } });
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

for (const route of routes) {
  test(`accessibility structure ${route}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const failed: string[] = [];
    page.on("response", (response) => {
      if (
        response.status() >= 400 &&
        !(route === "/404/" && response.url().endsWith("/404/"))
      )
        failed.push(response.url());
    });
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toHaveCount(1);
    const issues = await page.evaluate(() => {
      const problems: string[] = [];
      if (!document.documentElement.lang) problems.push("Missing language");
      if (document.querySelector("a.project-card[aria-label]"))
        problems.push("Project card label overrides visible content");
      let previous = 0;
      for (const heading of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
        const level = Number(heading.tagName[1]);
        if (level > previous + 1)
          problems.push(`Skipped heading: ${heading.textContent}`);
        previous = level;
      }
      for (const image of document.querySelectorAll("img")) {
        if (!image.hasAttribute("alt"))
          problems.push(`Missing alt: ${image.src}`);
        if (image.complete && !image.naturalWidth)
          problems.push(`Broken image: ${image.src}`);
      }
      return problems;
    });
    expect.soft(issues).toEqual([]);
    expect.soft(errors).toEqual([]);
    expect.soft(failed).toEqual([]);
    await assertNamedControls(page);
    await page.screenshot({
      path: testInfo.outputPath("desktop.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await assertNamedControls(page);
    await page.screenshot({
      path: testInfo.outputPath("mobile.png"),
      fullPage: true,
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  });
}

test("accessible names resolve label references and native labels", async ({ page }) => {
  await page.setContent(`
    <span id="label" hidden>Open projects</span>
    <button aria-labelledby="label"></button>
    <label for="query">Search projects</label><input id="query">
    <button title="Close projects"></button>
    <button aria-hidden="true" tabindex="-1"></button>
    <div inert><button></button></div>
  `);
  await assertNamedControls(page);
});

for (const label of ["missing", "empty"]) {
  test(`the accessibility audit rejects a ${label} referenced label`, async ({ page }) => {
    await page.setContent(`<span id="empty"></span><button aria-labelledby="${label}"></button>`);
    await expect(assertNamedControls(page)).rejects.toThrow(/toHaveAccessibleName/);
  });
}

test("skip link moves keyboard focus to main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile menu traps focus and Escape returns to trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.locator("#mobile-menu-btn");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () =>
          document.activeElement?.id === "mobile-menu-btn" ||
          !!document.activeElement?.closest("#mobile-menu"),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await expect(page.locator("#mobile-menu")).toBeHidden();
});
