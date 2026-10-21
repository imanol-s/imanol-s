import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

for (const width of [390, 1280]) {
  test(`gallery navigation and history restore reading position at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const cards = page.locator("#projects .project-card");
    await expect(cards).toHaveCount(5);
    const card = cards.filter({ hasText: "Library Management System" });
    await card.scrollIntoViewIfNeeded();
    const savedY = await page.evaluate(() => scrollY);
    expect(savedY).toBeGreaterThan(100);
    await card.click();
    await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Library Management System");
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - savedY)).toBeLessThanOrEqual(2);
    await page.goForward();
    await expect(page).toHaveURL(/\/projects\/library-management\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: "All projects", exact: true }).click();
    await expect(page).toHaveURL("/#projects");
    await expect(page.locator("#projects h2")).toBeInViewport();
  });

  test(`project contents reveal the selected chapter at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/projects/sensori-robotics");
    const contents = page.locator(".project-contents");
    if (width === 390) await contents.locator(":scope > summary").click();
    await contents.getByRole("link", { name: "Training loop", exact: true }).click();
    const heading = page.getByRole("heading", { name: "Training loop", exact: true });
    await expect(page).toHaveURL(/#training-loop$/);
    await expect(heading).toBeInViewport();
    await expect(heading).toBeFocused();
    await expect(contents.locator('[aria-current="location"]')).toHaveText("Training loop");
  });
}

test("keyboard skip link and mobile menu preserve focus", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  const menu = page.locator("#mobile-menu-btn");
  await expect(menu).toHaveAccessibleName("Open menu");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  // macOS WebKit requires Option+Tab to include links in native keyboard traversal.
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(page.locator("#mobile-menu a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
});
