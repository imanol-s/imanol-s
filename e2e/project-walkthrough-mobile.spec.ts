import { expect, test } from "@playwright/test";

const chapters = [
  "Why simulation",
  "Building the environment",
  "Training loop",
  "Hardware boundary",
  "What the work produced",
];

for (const width of [320, 390]) {
  test(`project contents uses one accessible toolbar at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/sensori-robotics");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".project-article")).not.toHaveAttribute(
      "data-scroll-pane",
      "",
    );
    await expect(page.locator(".project-article")).toHaveCSS(
      "overflow-y",
      "visible",
    );
    const rail = page.getByRole("complementary", {
      name: "Project navigation and details",
    });
    const contents = rail.locator(".project-contents");
    const toggle = contents.locator(":scope > summary");
    const back = rail.getByRole("link", { name: "All projects", exact: true });
    await expect(back).toHaveAttribute("href", "/#projects");
    await expect(rail.locator('[aria-current="location"]')).toHaveCount(1);
    const toolbar = await rail.boundingBox();
    expect(
      toolbar!.height,
      "The collapsed toolbar must occupy one row, not a stacked card",
    ).toBeLessThanOrEqual(56);
    for (const control of [back, toggle]) {
      const target = await control.boundingBox();
      expect(target!.height).toBeGreaterThanOrEqual(44);
      expect(target!.width).toBeGreaterThanOrEqual(44);
    }
    const backBox = await back.boundingBox();
    const toggleBox = await toggle.boundingBox();
    expect(Math.abs(backBox!.y - toggleBox!.y)).toBeLessThanOrEqual(1);
    await expect(toggle.locator(".contents-label")).toHaveText("Contents");
    const currentChapter = toggle.locator(".contents-current");
    await expect(currentChapter).toBeVisible();
    await expect(currentChapter).toHaveText("Why simulation");
    await expect(toggle).toHaveAccessibleName(/^Contents.*Why simulation$/);
    const facts = page.getByRole("region", {
      name: "Project details",
      exact: true,
    });
    await expect(
      page.locator(".project-article .project-metadata"),
    ).toBeVisible();
    await expect(facts).toHaveCount(1);
    await expect(page.locator(".project-metadata:visible")).toHaveCount(1);
    await expect(facts).toContainText("Aug 2025 to Dec 2025");
    await expect(
      facts.getByText("Tools & techniques", { exact: true }),
    ).toBeVisible();
    await expect(facts.getByText("Project", { exact: true })).toHaveCount(0);
    const openingBox = await page.locator(".project-opening").boundingBox();
    const factsBox = await facts.boundingBox();
    const whyBox = await page
      .getByRole("heading", { name: "Why simulation", exact: true })
      .boundingBox();
    expect(factsBox!.y).toBeGreaterThanOrEqual(
      openingBox!.y + openingBox!.height,
    );
    expect(factsBox!.y + factsBox!.height).toBeLessThanOrEqual(whyBox!.y);
    for (const tool of await facts.locator(".project-tools li").all()) {
      const box = await tool.boundingBox();
      expect(box!.x + box!.width).toBeLessThanOrEqual(
        factsBox!.x + factsBox!.width + 1,
      );
    }
    await toggle.click();
    await expect(contents).toHaveAttribute("open", "");
    await expect(contents.locator("details, .project-metadata")).toHaveCount(0);
    await expect(rail.locator(".contents-link")).toHaveText(chapters);
    for (const title of chapters)
      await expect(
        rail.getByRole("link", { name: title, exact: true }),
      ).toBeVisible();
    await expect(facts).toBeVisible();
    await expect(page.locator(".project-metadata:visible")).toHaveCount(1);
    await rail
      .getByRole("link", { name: "Training loop", exact: true })
      .click();
    await expect(contents).not.toHaveAttribute("open", "");
    await expect(page).toHaveURL(/#training-loop$/);
    const heading = page.getByRole("heading", {
      name: "Training loop",
      exact: true,
    });
    await expect(heading).toBeFocused();
    await expect(currentChapter).toHaveText("Training loop");
    await expect(toggle).toHaveAccessibleName(/^Contents.*Training loop$/);
    await expect(
      rail.locator('.contents-link[aria-current="location"]'),
    ).toHaveText("Training loop");
    const headingBox = await heading.boundingBox();
    const stickyBox = await rail.boundingBox();
    const headerBox = await page.locator(".site-header").boundingBox();
    expect(headingBox!.y).toBeGreaterThanOrEqual(
      Math.max(
        stickyBox!.y + stickyBox!.height,
        headerBox!.y + headerBox!.height,
      ),
    );
    await toggle.click();
    await rail
      .getByRole("link", { name: "Why simulation", exact: true })
      .focus();
    await page.keyboard.press("Escape");
    await expect(contents).not.toHaveAttribute("open", "");
    await expect(toggle).toBeFocused();
    const lastHeading = page.getByRole("heading", {
      name: "What the work produced",
      exact: true,
    });
    await page.mouse.wheel(0, (await lastHeading.boundingBox())!.y);
    await expect(currentChapter).toHaveText("What the work produced");
    await expect(
      rail.locator('.contents-link[aria-current="location"]'),
    ).toHaveText("What the work produced");
    await expect(contents).not.toHaveAttribute("open", "");
    await expect(toggle).toHaveAccessibleName(
      /^Contents.*What the work produced$/,
    );
    expect((await rail.boundingBox())!.height).toBeLessThanOrEqual(56);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.goto("/projects/sensori-robotics#training-loop");
    await expect(currentChapter).toHaveText("Training loop");
    await expect(
      rail.locator('.contents-link[aria-current="location"]'),
    ).toHaveText("Training loop");
    await page.goto("/projects/sensori-robotics#what-the-work-produced");
    await expect(currentChapter).toHaveText("What the work produced");
    await page.goBack();
    await expect(currentChapter).toHaveText("Training loop");
  });
}

test("desktop keeps the visible project sidebar and metadata", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/projects/sensori-robotics");
  const rail = page.getByRole("complementary", {
    name: "Project navigation and details",
  });
  await expect(rail.locator(".project-contents > summary")).not.toBeVisible();
  await expect(rail.locator(".contents-link")).toHaveText(chapters);
  for (const title of chapters)
    await expect(
      rail.getByRole("link", { name: title, exact: true }),
    ).toBeVisible();
  const facts = page.getByRole("region", {
    name: "Project details",
    exact: true,
  });
  await expect(facts).toHaveCount(1);
  await expect(rail.locator(".project-metadata")).toBeVisible();
  await expect(page.locator(".project-metadata:visible")).toHaveCount(1);
  await expect(facts.getByText("Project", { exact: true })).toBeVisible();
  await expect(facts).toContainText("Sensori Robotics");
  await expect(rail.locator(".project-contents .project-metadata")).toHaveCount(
    0,
  );
  await expect(rail.locator(".project-contents details")).toHaveCount(0);
});

test.describe("native contents without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const width of [320, 390]) {
    test(`chapters and metadata remain reachable at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/projects/sensori-robotics");
      const rail = page.getByRole("complementary", {
        name: "Project navigation and details",
      });
      const contents = rail.locator(".project-contents");
      const toggle = contents.locator(":scope > summary");
      await expect(toggle).toHaveText("Contents");
      await expect(toggle.locator(".contents-current")).toBeHidden();
      if ((await contents.getAttribute("open")) !== null) await toggle.click();
      await toggle.click();
      for (const title of chapters)
        await expect(
          rail.getByRole("link", { name: title, exact: true }),
        ).toBeVisible();
      const facts = page.getByRole("region", {
        name: "Project details",
        exact: true,
      });
      await expect(facts).toHaveCount(1);
      await expect(
        page.locator(".project-article .project-metadata"),
      ).toBeVisible();
      await expect(facts).toContainText("Aug 2025 to Dec 2025");
      await expect(contents.locator("details, .project-metadata")).toHaveCount(
        0,
      );
      await expect(page.locator(".project-metadata:visible")).toHaveCount(1);
      await rail
        .getByRole("link", { name: "Training loop", exact: true })
        .click();
      await expect(page).toHaveURL(/#training-loop$/);
    });
  }
});

test("compact project facts preserve optional dates and repository access", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/automaton");
  let facts = page.getByRole("region", {
    name: "Project details",
    exact: true,
  });
  await expect(facts).toHaveCount(1);
  await expect(facts.getByText("When", { exact: true })).toHaveCount(0);
  await expect(
    facts.getByRole("link", { name: /View repository/ }),
  ).toHaveCount(0);
  await expect(facts.locator(".project-tools li")).toHaveText([
    "Python",
    "JavaScript",
    "Selenium",
    "PySide6",
  ]);
  await page.goto("/projects/pert-scheduling");
  facts = page.getByRole("region", { name: "Project details", exact: true });
  await expect(facts).toHaveCount(1);
  await expect(facts).toContainText("Aug 2024 to Dec 2024");
  const source = facts.getByRole("link", { name: /View repository/ });
  await expect(source).toHaveAttribute(
    "href",
    "https://github.com/imanol-s/Critical-Task",
  );
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(source).toHaveAttribute("rel", "noopener noreferrer");
});

test.describe("mobile text reflow", () => {
  test.use({ isMobile: true, hasTouch: true });
  for (const width of [320, 390, 768]) {
    for (const path of [
      "/",
      "/projects/library-management",
      "/projects/sensori-robotics",
    ]) {
      test(`200% text fits ${path} at ${width}px without viewport shrinking`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(path);
        await page.locator("html").evaluate((root) =>
          root.style.setProperty("font-size", "200%", "important"),
        );
        await expect(page.locator("html")).toHaveCSS("font-size", "32px");
        await page.evaluate(() => document.fonts.ready);
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth,
            ),
          )
          .toBeLessThanOrEqual(1);
        const layout = await page.evaluate(() => {
          const selectors = [
            "body",
            ".site-footer",
            ".footer-contact",
            ".footer-links",
            ".project-article",
            ".project-narrative",
            ".training-loop",
          ];
          const boxes = selectors.flatMap((selector) =>
            [...document.querySelectorAll(selector)].map((node) => {
              const b = node.getBoundingClientRect();
              return { selector, left: b.left, right: b.right };
            }),
          );
          const svgBoxes = [...document.querySelectorAll(".training-loop svg")]
            .filter(
              (node) =>
                node.getClientRects().length &&
                getComputedStyle(node).display !== "none",
            )
            .map((node) => {
              const b = node.getBoundingClientRect();
              return { selector: "diagram SVG", left: b.left, right: b.right };
            });
          return {
            boxes: [...boxes, ...svgBoxes],
            width: document.documentElement.clientWidth,
            scale: window.visualViewport?.scale ?? 1,
            rootText: parseFloat(
              getComputedStyle(document.documentElement).fontSize,
            ),
          };
        });
        expect(layout.rootText).toBe(32);
        expect(layout.scale).toBeCloseTo(1, 2);
        if (path === "/projects/sensori-robotics") {
          await expect(page.locator(".project-article")).not.toHaveAttribute(
            "data-scroll-pane",
            "",
          );
          await expect(page.locator(".project-article")).toHaveCSS(
            "overflow-y",
            "visible",
          );
          const toolbar = page.locator(".project-rail");
          const toggle = toolbar.locator(".project-contents > summary");
          await expect(toggle.locator(".contents-current")).toHaveText(
            "Why simulation",
          );
          await expect(toggle).toHaveAccessibleName(
            /^Contents.*Why simulation$/,
          );
          const bar = (await toolbar.boundingBox())!;
          expect(bar.height).toBeGreaterThanOrEqual(44);
          expect(bar.height).toBeLessThanOrEqual(56);
          expect(bar.x + bar.width).toBeLessThanOrEqual(layout.width + 1);
          const summaryBox = (await toggle.boundingBox())!;
          expect(summaryBox.x + summaryBox.width).toBeLessThanOrEqual(
            bar.x + bar.width + 1,
          );
        }
        for (const box of layout.boxes) {
          expect(
            box.left,
            `${box.selector} left boundary`,
          ).toBeGreaterThanOrEqual(-1);
          expect(
            box.right,
            `${box.selector} right boundary`,
          ).toBeLessThanOrEqual(layout.width + 1);
        }
      });
    }
  }
});

test("opening the global mobile menu leaves the project toolbar in place", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/sensori-robotics");
  const rail = page.getByRole("complementary", {
    name: "Project navigation and details",
  });
  const before = (await rail.boundingBox())!;
  const menuButton = page.getByRole("button", {
    name: "Open menu",
    exact: true,
  });
  await menuButton.click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await expect
    .poll(async () => Math.abs((await rail.boundingBox())!.y - before.y))
    .toBeLessThanOrEqual(1);
  expect(
    await page.evaluate(() => {
      const menu = document.querySelector("#mobile-menu")!;
      const rail = document.querySelector(".project-rail")!;
      const m = menu.getBoundingClientRect();
      const r = rail.getBoundingClientRect();
      const x = (Math.max(m.left, r.left) + Math.min(m.right, r.right)) / 2;
      const y = (Math.max(m.top, r.top) + Math.min(m.bottom, r.bottom)) / 2;
      return menu.contains(document.elementFromPoint(x, y));
    }),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).not.toBeVisible();
  await expect(menuButton).toBeFocused();
  const contents = rail.locator(".project-contents");
  await contents.locator(":scope > summary").click();
  await rail.getByRole("link", { name: "Training loop", exact: true }).click();
  const heading = page.getByRole("heading", {
    name: "Training loop",
    exact: true,
  });
  await expect(heading).toBeFocused();
  await expect(page).toHaveURL(/#training-loop$/);
  const headingBox = (await heading.boundingBox())!;
  const railBox = (await rail.boundingBox())!;
  const headerBox = (await page.locator(".header-surface").boundingBox())!;
  expect(headingBox.y).toBeGreaterThanOrEqual(
    Math.max(railBox.y + railBox.height, headerBox.y + headerBox.height),
  );
});

for (const viewport of [{ width: 1440, height: 900 }]) {
  test(`desktop Library pane follows its own reading position at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/library-management");
    await page.evaluate(() => document.fonts.ready);
    const pane = page.getByRole("article", {
      name: "Library Management System",
      exact: true,
    });
    const active = page.locator('.contents-link[aria-current="location"]');
    await expect(pane).toHaveAttribute("data-scroll-pane", "");
    await expect(pane).toHaveAttribute("tabindex", "0");
    const initial = await pane.evaluate((node) => ({
      height: node.getBoundingClientRect().height,
      bottom: node.getBoundingClientRect().bottom,
      client: node.clientHeight,
      content: node.scrollHeight,
    }));
    expect(initial.height).toBeGreaterThanOrEqual(600);
    expect(initial.bottom).toBeLessThanOrEqual(viewport.height - 23);
    expect(
      (await page.locator(".site-footer").boundingBox())!.y,
    ).toBeGreaterThan(initial.bottom);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeGreaterThan(viewport.height);
    expect(initial.content).toBeGreaterThan(initial.client + 100);
    await expect(active).toHaveText("The problem");
    const outerBefore = await page.evaluate(() => window.scrollY);
    await pane.hover();
    await page.mouse.wheel(0, 200);
    await expect
      .poll(() => pane.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(100);
    expect(await page.evaluate(() => window.scrollY)).toBe(outerBefore);
    await expect(active).toHaveText("The problem");
    await page
      .getByRole("link", { name: "My contribution", exact: true })
      .click();
    const contribution = page.getByRole("heading", {
      name: "My contribution",
      exact: true,
    });
    await expect(contribution).toBeFocused();
    await expect(active).toHaveText("My contribution");
    const paneBox = (await pane.boundingBox())!;
    const contributionBox = (await contribution.boundingBox())!;
    expect(contributionBox.y).toBeGreaterThanOrEqual(paneBox.y);
    expect(contributionBox.y + contributionBox.height).toBeLessThanOrEqual(
      paneBox.y + paneBox.height,
    );
    const modeling = page.getByRole("heading", {
      name: "The modeling decision",
      exact: true,
    });
    await pane.hover();
    await page.mouse.wheel(
      0,
      (await modeling.boundingBox())!.y - paneBox.y - 16,
    );
    await expect(active).toHaveText("The modeling decision");
    await pane.focus();
    await page.keyboard.press("End");
    await expect(active).toHaveText("The result and lesson");
    expect(
      await pane.evaluate(
        (node) => node.scrollHeight - node.clientHeight - node.scrollTop,
      ),
    ).toBeLessThanOrEqual(2);
    await pane.hover();
    await page.mouse.wheel(
      0,
      (await modeling.boundingBox())!.y - (await pane.boundingBox())!.y - 16,
    );
    await expect(active).toHaveText("The modeling decision");
    await page.goto("/projects/library-management#my-contribution");
    await expect(active).toHaveText("My contribution");
    await expect(contribution).toBeFocused();
    const directPane = (await pane.boundingBox())!;
    const directHeading = (await contribution.boundingBox())!;
    expect(directPane.y).toBeGreaterThanOrEqual(
      (await page.locator(".header-surface").boundingBox())!.y + 56,
    );
    expect(directHeading.y).toBeGreaterThanOrEqual(directPane.y);
    expect(directHeading.y + directHeading.height).toBeLessThanOrEqual(
      directPane.y + directPane.height,
    );
    await page
      .getByRole("link", { name: "The modeling decision", exact: true })
      .click();
    await expect(page).toHaveURL(/#the-modeling-decision$/);
    await page.goBack();
    await expect(active).toHaveText("My contribution");
    await expect(contribution).toBeFocused();
    const backPane = (await pane.boundingBox())!;
    const backHeading = (await contribution.boundingBox())!;
    expect(backHeading.y).toBeGreaterThanOrEqual(backPane.y);
    expect(backHeading.y + backHeading.height).toBeLessThanOrEqual(
      backPane.y + backPane.height,
    );
  });
}

test("tall Sensori desktop uses the available height and ends at its footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1141, height: 2464 });
  await page.goto("/projects/sensori-robotics");
  await page.evaluate(() => document.fonts.ready);
  const pane = page.getByRole("article", {
    name: "Sensori Robotics",
    exact: true,
  });
  await expect(pane).toHaveAttribute("data-scroll-pane", "");
  await expect
    .poll(async () =>
      Math.abs(
        (await page.locator(".site-footer").boundingBox())!.y +
          (await page.locator(".site-footer").boundingBox())!.height -
          2464,
      ),
    )
    .toBeLessThanOrEqual(2);
  expect((await pane.boundingBox())!.height).toBeGreaterThan(1200);
  expect(
    await pane.evaluate((node) => node.scrollHeight - node.clientHeight),
  ).toBeGreaterThan(1);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight,
    ),
  ).toBeLessThanOrEqual(2);
  await expect(
    page.locator('.contents-link[aria-current="location"]'),
  ).toHaveText("Why simulation");
  await page.getByRole("link", { name: "Training loop", exact: true }).click();
  const heading = page.getByRole("heading", {
    name: "Training loop",
    exact: true,
  });
  await expect(heading).toBeFocused();
  await expect(
    page.locator('.contents-link[aria-current="location"]'),
  ).toHaveText("Training loop");
  const paneBox = (await pane.boundingBox())!;
  const headingBox = (await heading.boundingBox())!;
  expect(headingBox.y).toBeGreaterThanOrEqual(paneBox.y);
  expect(headingBox.y + headingBox.height).toBeLessThanOrEqual(
    paneBox.y + paneBox.height,
  );
});

test("a shorter Library story can fit the tall pane without marking its last chapter", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1113, height: 2464 });
  await page.goto("/projects/library-management");
  await page.evaluate(() => document.fonts.ready);
  const pane = page.getByRole("article", {
    name: "Library Management System",
    exact: true,
  });
  await expect(pane).toHaveAttribute("data-scroll-pane", "");
  await expect
    .poll(async () =>
      Math.abs(
        (await page.locator(".site-footer").boundingBox())!.y +
          (await page.locator(".site-footer").boundingBox())!.height -
          2464,
      ),
    )
    .toBeLessThanOrEqual(2);
  const geometry = await pane.evaluate((node) => ({
    height: node.getBoundingClientRect().height,
    content: node.scrollHeight,
    client: node.clientHeight,
    scrollTop: node.scrollTop,
  }));
  expect(geometry.height).toBeGreaterThan(1200);
  expect(geometry.content).toBeLessThanOrEqual(geometry.client + 1);
  expect(geometry.scrollTop).toBe(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight,
    ),
  ).toBeLessThanOrEqual(2);
  await expect(
    page.locator('.contents-link[aria-current="location"]'),
  ).toHaveText("The problem");
});

test("a short desktop window keeps a usable pane and native access to the outer footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 480 });
  await page.goto("/projects/sensori-robotics");
  const pane = page.getByRole("article", {
    name: "Sensori Robotics",
    exact: true,
  });
  await expect(pane).toHaveAttribute("data-scroll-pane", "");
  expect((await pane.boundingBox())!.height).toBeGreaterThanOrEqual(320);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeGreaterThan(480);
  await pane.focus();
  await page.keyboard.press("End");
  await expect(
    page.locator('.contents-link[aria-current="location"]'),
  ).toHaveText("What the work produced");
  await pane.hover();
  await page.mouse.wheel(0, 2000);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await expect(page.locator(".site-footer")).toBeInViewport();
});

test("long desktop Sensori story uses the pane and mobile resize preserves its chapter", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects/sensori-robotics#training-loop");
  await page.evaluate(() => document.fonts.ready);
  const pane = page.getByRole("article", {
    name: "Sensori Robotics",
    exact: true,
  });
  const heading = page.getByRole("heading", {
    name: "Training loop",
    exact: true,
  });
  const active = page.locator('.contents-link[aria-current="location"]');
  await expect(pane).toHaveAttribute("data-scroll-pane", "");
  expect(
    await pane.evaluate((node) => node.scrollHeight - node.clientHeight),
  ).toBeGreaterThan(500);
  await expect(active).toHaveText("Training loop");
  await expect(heading).toBeFocused();
  const box = (await pane.boundingBox())!;
  expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(box.y);
  expect(
    (await heading.boundingBox())!.y + (await heading.boundingBox())!.height,
  ).toBeLessThanOrEqual(box.y + box.height);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(pane).not.toHaveAttribute("data-scroll-pane", "");
  await expect(pane).toHaveCSS("overflow-y", "visible");
  await expect(active).toHaveText("Training loop");
  await expect
    .poll(
      async () =>
        (await heading.boundingBox())!.y -
        ((await page.locator(".project-rail").boundingBox())!.y +
          (await page.locator(".project-rail").boundingBox())!.height),
    )
    .toBeGreaterThanOrEqual(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(pane).toHaveAttribute("data-scroll-pane", "");
  await expect(active).toHaveText("Training loop");
  await expect
    .poll(
      async () =>
        (await heading.boundingBox())!.y - (await pane.boundingBox())!.y,
    )
    .toBeGreaterThanOrEqual(0);
  await page.emulateMedia({ media: "print" });
  await expect(pane).toHaveCSS("max-height", "none");
  await expect(pane).toHaveCSS("overflow-y", "visible");
  await expect(page.locator("body")).toHaveCSS("display", "block");
});

test.describe("desktop story without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the full Library article remains in normal document flow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/projects/library-management");
    const pane = page.getByRole("article", {
      name: "Library Management System",
      exact: true,
    });
    await expect(pane).not.toHaveAttribute("data-scroll-pane", "");
    await expect(pane).toHaveCSS("overflow-y", "visible");
    await expect(page.locator(".project-scroll-cue")).toBeHidden();
    expect((await pane.boundingBox())!.height).toBeGreaterThan(900);
    await page
      .getByRole("link", { name: "The result and lesson", exact: true })
      .click();
    await expect(page).toHaveURL(/#the-result-and-lesson$/);
    await expect(
      page.getByRole("heading", { name: "The result and lesson", exact: true }),
    ).toBeInViewport();
  });
});

test("desktop scroll cue reflects remaining content without becoming a control", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1141, height: 1262 });
  await page.goto("/projects/library-management");
  await page.evaluate(() => document.fonts.ready);
  const pane = page.getByRole("article", {
    name: "Library Management System",
    exact: true,
  });
  const cue = page.locator(".project-scroll-cue");
  await expect(cue).toBeVisible();
  await expect(cue).toHaveAttribute("aria-hidden", "true");
  await expect(cue).toHaveCSS("pointer-events", "none");
  await expect(cue).not.toHaveAttribute("tabindex", /./);
  expect(
    await pane.evaluate((node) => node.scrollHeight - node.clientHeight),
  ).toBeGreaterThan(100);
  const paneBox = (await pane.boundingBox())!;
  const cueBox = (await cue.boundingBox())!;
  expect(cueBox.x + cueBox.width).toBeLessThanOrEqual(
    paneBox.x + paneBox.width - 2,
  );
  expect(cueBox.y + cueBox.height).toBeLessThanOrEqual(
    paneBox.y + paneBox.height - 2,
  );
  await pane.focus();
  await page.keyboard.press("End");
  await expect(cue).toBeHidden();
  await pane.hover();
  await page.mouse.wheel(0, -100);
  await expect(cue).toBeVisible();
  await page
    .getByRole("link", { name: "My contribution", exact: true })
    .click();
  await expect(
    page.locator('.contents-link[aria-current="location"]'),
  ).toHaveText("My contribution");
  await expect(cue).toBeVisible();
  await page.setViewportSize({ width: 1113, height: 2464 });
  await expect
    .poll(() => pane.evaluate((node) => node.scrollHeight - node.clientHeight))
    .toBeLessThanOrEqual(1);
  await expect(cue).toBeHidden();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(pane).not.toHaveAttribute("data-scroll-pane", "");
  await expect(cue).toBeHidden();
  await page.setViewportSize({ width: 1141, height: 1262 });
  await page.goto("/projects/library-management");
  await expect(cue).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(cue).toBeHidden();
});
