import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

test("Automaton is discoverable from the complete homepage gallery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#projects a.project-card")).toHaveCount(5);
  const automaton = page.locator('a.project-card[href="/projects/automaton"]');
  await expect(automaton).toContainText("Automaton");
  await expect(automaton).toHaveAttribute("href", "/projects/automaton");
  await page.locator('a.project-card[href="/projects/automaton"]').click();
  await expect(page).toHaveURL(/\/projects\/automaton\/?$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Automaton" }),
  ).toBeVisible();
});

test("estimated time avoided and architecture diagrams remain readable at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/projects/automaton/");
  const chart = page.getByRole("figure", {
    name: /Estimated manual work avoided/,
  });
  await expect(chart).toBeVisible();
  await expect(chart).toContainText("76–119.5");
  await expect(chart).toContainText("not net time saved");
  await expect(chart).toContainText(
    "monitoring, and review time have not been deducted",
  );
  const system = page.getByRole("figure", {
    name: /Separate policy from browser mechanics/,
  });
  const workflow = page.getByRole("figure", {
    name: /Check before changing a record/,
  });
  await expect(system).toBeVisible();
  await expect(workflow).toBeVisible();
  await expect(system).toContainText("Run journals");
  await expect(workflow).toContainText("Already matches");
  await expect(workflow).toContainText("Change needed");
  await expect(workflow).toContainText(
    "Save and verification rules remain specific to each workflow.",
  );
  await expect(page.locator(".project-opening")).toBeVisible();
  await expect(page.locator(".project-opening")).not.toContainText(
    /Invalid Date|NaN/,
  );
  const details = page
    .locator(".project-facts-compact")
    .getByRole("region", { name: "Project details" });
  await expect(details).toBeVisible();
  await expect(
    details.getByRole("term", { name: "When", exact: true }),
  ).toHaveCount(0);
  await expect(details).not.toContainText(/Invalid Date|NaN/);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
