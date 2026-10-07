import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";

const projectCount = readdirSync("src/content/projects").filter((file) =>
  file.endsWith(".mdx"),
).length;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

test("every project is discoverable from the homepage and project collection", async ({
  page,
}) => {
  for (const path of ["/", "/projects/"]) {
    await page.goto(path);
    await expect(page.locator("a.project-card")).toHaveCount(projectCount);
    const automaton = page.locator(
      'a.project-card[href="/projects/automaton"]',
    );
    await expect(automaton).toContainText("Automaton");
    await expect(automaton).toHaveAttribute("href", "/projects/automaton");
  }
  await page.locator('a.project-card[href="/projects/automaton"]').click();
  await expect(page).toHaveURL(/\/projects\/automaton\/?$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Automaton" }),
  ).toBeVisible();
});

test("operation measurements and both architecture diagrams remain readable at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/projects/automaton/");
  const chart = page.getByRole("figure", {
    name: /One blank-field check, before and after/,
  });
  await expect(chart).toBeVisible();
  await expect(chart).toContainText("8.0 s");
  await expect(chart).toContainText("≈0.1 s");
  await expect(chart).toContainText("≈80");
  await expect(chart).toContainText(
    "These measurements describe this check, not an entire record or run.",
  );
  const system = page.getByRole("figure", {
    name: /Separate policy from browser mechanics/,
  });
  const workflow = page.getByRole("figure", {
    name: /Check before changing a record/,
  });
  await expect(system).toContainText("Run journals");
  await expect(workflow).toContainText("Already matches");
  await expect(workflow).toContainText("Change needed");
  await expect(workflow).toContainText(
    "Save and verification rules remain specific to each workflow.",
  );
  await expect(page.locator(".project-header")).not.toContainText(
    /Invalid Date|NaN/,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
