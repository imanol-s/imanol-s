import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const waitForNavigation = async (page: Page) => {
  const header = page.locator(".site-header");
  await expect
    .poll(() =>
      header.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue(
          "--header-expanded-width",
        ),
      ),
    )
    .not.toBe("");
  return header;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("site-lifecycle-ready", "true"),
  );
});

test("legacy project index builds a static redirect fallback", () => {
  const html = readFileSync("dist/projects/index.html", "utf8");
  expect(html).toContain(
    '<meta http-equiv="refresh" content="0;url=/#projects">',
  );
  expect(html).toContain('<a href="/#projects">');
  expect(html).not.toContain('class="project-grid"');
});

for (const path of ["/projects", "/projects/"]) {
  test(`legacy ${path} reaches the homepage gallery`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL("/#projects");
    await expect(page.locator("#projects h2")).toBeInViewport();
    await expect(page.locator("#projects .project-card")).toHaveCount(5);
  });
}

const caseStudies = [
  {
    id: "sensori-robotics",
    title: "Sensori Robotics",
    previous: null,
    next: "/projects/library-management",
  },
  {
    id: "library-management",
    title: "Library Management System",
    previous: "/projects/sensori-robotics",
    next: "/projects/crime-analysis",
  },
  {
    id: "crime-analysis",
    title: "Dallas Crime & Housing",
    previous: "/projects/library-management",
    next: "/projects/pert-scheduling",
  },
  {
    id: "pert-scheduling",
    title: "Critical Task",
    previous: "/projects/crime-analysis",
    next: "/projects/automaton",
  },
  {
    id: "automaton",
    title: "Automaton",
    previous: "/projects/pert-scheduling",
    next: null,
  },
];

for (const { id, title, previous, next } of caseStudies) {
  test(`${id} remains a case study with the same neighboring projects`, async ({
    page,
  }) => {
    const response = await page.goto(`/projects/${id}`);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "All projects", exact: true }),
    ).toHaveAttribute("href", "/#projects");
    const pagination = page.getByRole("navigation", {
      name: "More projects",
      exact: true,
    });
    const previousLink = pagination.getByRole("link", {
      name: /^Previous project/,
    });
    const nextLink = pagination.getByRole("link", { name: /^Next project/ });
    if (previous) await expect(previousLink).toHaveAttribute("href", previous);
    else await expect(previousLink).toHaveCount(0);
    if (next) await expect(nextLink).toHaveAttribute("href", next);
    else await expect(nextLink).toHaveCount(0);
  });
}

for (const width of [390, 1280]) {
  test(`All projects returns to the complete gallery at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/projects/library-management");
    await page.getByRole("link", { name: "All projects", exact: true }).click();
    await expect(page).toHaveURL("/#projects");
    await expect(page.locator("#projects h2")).toBeInViewport();
    await expect(page.locator("#projects .project-card")).toHaveCount(5);
  });
}

test.describe("Site navigation", () => {
  test("desktop WORK returns from a case study to the homepage gallery", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects/library-management");
    const work = page
      .locator(".desktop-links")
      .getByRole("link", { name: "WORK", exact: true });
    await expect(work).toHaveAttribute("href", "/#projects");
    await work.click();
    await expect(page).toHaveURL("/#projects");
    await expect(page.locator("#projects h2")).toHaveText("Projects");
    await expect(page.locator("#projects .project-card")).toHaveCount(5);
  });

  test("homepage gallery contains all five projects without a duplicate index link", async ({
    page,
  }) => {
    await page.goto("/");
    const cards = page.locator("#projects .project-card");
    await expect(cards.locator(".project-title")).toHaveText([
      "Sensori Robotics",
      "Library Management System",
      "Dallas Crime & Housing",
      "Critical Task",
      "Automaton",
    ]);
    expect(
      await cards.evaluateAll((links) =>
        links.map((link) => link.getAttribute("href")),
      ),
    ).toEqual([
      "/projects/sensori-robotics",
      "/projects/library-management",
      "/projects/crime-analysis",
      "/projects/pert-scheduling",
      "/projects/automaton",
    ]);
    await expect(
      page.locator('a[href="/projects"], a[href="/projects/"]'),
    ).toHaveCount(0);
    await expect(
      page.locator("#projects").getByRole("link", { name: /All projects/i }),
    ).toHaveCount(0);
  });

  test("keyboard navigation remains clickable after switching to pointer input", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const header = await waitForNavigation(page);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-brand")).toBeFocused();
    await page.evaluate(() =>
      window.scrollTo({ top: 200, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect
      .poll(() =>
        header.evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBe(12);
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.locator('.desktop-links a[href="/#projects"]').click();
    await expect(page).toHaveURL("/#projects");
    await expect(page.locator("#projects h2")).toBeInViewport();
  });

  test("floating header compacts, docks on descent and returns on ascent", async ({
    page,
  }) => {
    await page.goto("/");
    const header = await waitForNavigation(page);
    await page.evaluate(() =>
      window.scrollTo({ top: 50, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.evaluate(() =>
      window.scrollTo({ top: 250, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-docked", "");
    await page.evaluate(() =>
      window.scrollTo({ top: 210, behavior: "instant" }),
    );
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).not.toHaveAttribute("data-header-compact", "");
  });

  test("closed mobile menu does not pin the header after pointer focus", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const header = await waitForNavigation(page);
    const button = page.locator("#mobile-menu-btn");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.evaluate(() =>
      window.scrollTo({ top: 250, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-compact", "");
    await expect(header).not.toHaveAttribute("data-header-docked", "");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await page.evaluate(() =>
      window.scrollTo({ top: 400, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-header-docked", "");
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
  });

  test("404 page renders with back link", async ({ page }) => {
    const response = await page.goto("/nonexistent-page/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("text=Page not found")).toBeVisible();
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });
});
