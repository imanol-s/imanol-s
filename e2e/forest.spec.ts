import { test, expect, type Page } from "@playwright/test";

async function seekScene(page: Page, seconds: number) {
  const count = await page.locator(".forest-art").evaluate((svg, time) => {
    const animations = svg.getAnimations({ subtree: true });
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = time * 1000;
    }
    return animations.length;
  }, seconds);
  expect(count).toBeGreaterThan(0);
}

async function sceneState(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const style = getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    return {
      opacity: Number(style.opacity),
      x: matrix.e,
      angle: (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI,
    };
  });
}

test("forest tells its story once after 25 seconds", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".hero-landscape > .forest-scene")).toHaveCount(1);
  await expect(page.locator(".forest-art")).toHaveAttribute(
    "viewBox",
    "0 0 2103 748",
  );
  await expect(page.locator(".forest-art > image")).toHaveAttribute(
    "href",
    /hero-landscape.*\.webp/,
  );
  await expect(page.locator("#forest-pine")).toHaveAttribute(
    "href",
    /forest-pine.*\.webp/,
  );
  await expect(
    page.getByRole("button", { name: "Pause scenery animation" }),
  ).toBeVisible();
  await seekScene(page, 24);
  expect((await sceneState(page, ".forest-person")).opacity).toBe(0);
  expect((await sceneState(page, ".campfire")).opacity).toBe(0);
  const firstWind = await sceneState(page, ".second-pine");
  await seekScene(page, 28);
  expect((await sceneState(page, ".second-pine")).angle).not.toBeCloseTo(
    firstWind.angle,
    1,
  );
  const walking = await sceneState(page, ".forest-person");
  expect(walking.opacity).toBe(1);
  const left = await sceneState(page, ".left-leg");
  const right = await sceneState(page, ".right-leg");
  expect(left.angle * right.angle).toBeLessThan(0);
  expect((await sceneState(page, ".axe-arm")).opacity).toBe(0);
  await seekScene(page, 33);
  const chopping = await sceneState(page, ".forest-person");
  expect(chopping.x).toBeGreaterThan(walking.x);
  expect((await sceneState(page, ".axe-arm")).opacity).toBe(1);
  expect(Math.abs((await sceneState(page, ".axe-arm")).angle)).toBeGreaterThan(
    5,
  );
  await seekScene(page, 35);
  expect((await sceneState(page, ".forest-person")).x).toBeCloseTo(
    chopping.x,
    0,
  );
  await seekScene(page, 40);
  const falling = await sceneState(page, ".falling-tree");
  expect(falling.angle).toBeGreaterThan(5);
  expect(falling.angle).toBeLessThan(90);
  expect(
    await page
      .locator(".falling-tree")
      .evaluate((el) => getComputedStyle(el).transformOrigin),
  ).toBe("0px 0px");
  await seekScene(page, 42);
  expect((await sceneState(page, ".crouching-legs")).opacity).toBe(1);
  expect((await sceneState(page, ".person-torso")).angle).toBeGreaterThan(15);
  expect((await sceneState(page, ".axe-arm")).opacity).toBe(0);
  await seekScene(page, 45.5);
  expect((await sceneState(page, ".carried-wood")).opacity).toBe(1);
  expect((await sceneState(page, ".campfire")).opacity).toBe(0);
  const returning = await sceneState(page, ".forest-person");
  expect(returning.x).toBeLessThan(chopping.x);
  expect(
    (await sceneState(page, ".left-leg")).angle *
      (await sceneState(page, ".right-leg")).angle,
  ).toBeLessThan(0);
  await seekScene(page, 48.5);
  expect((await sceneState(page, ".crouching-legs")).opacity).toBe(1);
  expect((await sceneState(page, ".person-torso")).angle).toBeGreaterThan(15);
  expect((await sceneState(page, ".fire-flame")).opacity).toBe(0);
  await seekScene(page, 55);
  expect((await sceneState(page, ".campfire")).opacity).toBe(1);
  expect((await sceneState(page, ".fire-flame")).opacity).toBeGreaterThan(0);
  expect((await sceneState(page, ".falling-tree")).opacity).toBe(0);
  const resting = await sceneState(page, ".forest-person");
  const restedTorso = await sceneState(page, ".person-torso");
  expect(resting.x).toBeLessThan(returning.x);
  expect(restedTorso.angle).toBeLessThan(0);
  expect((await sceneState(page, ".resting-legs")).opacity).toBe(1);
  expect((await sceneState(page, ".standing-legs")).opacity).toBe(0);
  await seekScene(page, 150);
  expect((await sceneState(page, ".forest-person")).x).toBeCloseTo(
    resting.x,
    0,
  );
  expect((await sceneState(page, ".person-torso")).angle).toBeCloseTo(
    restedTorso.angle,
    0,
  );
  expect((await sceneState(page, ".campfire")).opacity).toBe(1);
  await page.setViewportSize({ width: 834, height: 1000 });
  for (const stage of [33, 48.5]) {
    await seekScene(page, stage);
    const actor = await page.locator(".forest-person").boundingBox();
    expect(actor).not.toBeNull();
    for (const selector of [".hero-headline", ".hero-description"]) {
      const text = await page.locator(selector).boundingBox();
      expect(text).not.toBeNull();
      expect(
        actor!.x + actor!.width <= text!.x ||
          actor!.x >= text!.x + text!.width ||
          actor!.y + actor!.height <= text!.y ||
          actor!.y >= text!.y + text!.height,
      ).toBe(true);
    }
  }
});

test("scenery can pause and reduced motion keeps only static trees", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const scene = page.locator(".forest-scene");
  await expect(scene).toHaveAttribute("data-paused", "false");
  await page.getByRole("button", { name: "Pause scenery animation" }).click();
  await expect(scene).toHaveAttribute("data-paused", "true");
  const states = await scene.evaluate((el) =>
    el.getAnimations({ subtree: true }).map((animation) => animation.playState),
  );
  expect(states.length).toBeGreaterThan(0);
  expect(states.every((state) => state === "paused")).toBe(true);
  await page.getByRole("button", { name: "Play scenery animation" }).click();
  await expect(scene).toHaveAttribute("data-paused", "false");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-paused", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await scene.scrollIntoViewIfNeeded();
  await expect(page.locator(".scenery-control")).toBeHidden();
  expect(
    await scene.evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  expect((await sceneState(page, ".forest-person")).opacity).toBe(0);
  expect((await sceneState(page, ".campfire")).opacity).toBe(0);
  expect((await sceneState(page, ".falling-tree")).opacity).toBe(1);
  expect((await sceneState(page, ".falling-tree")).angle).toBe(0);
});

test("scenery responds to page visibility signals", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const scene = page.locator(".forest-scene");
  await expect(scene).toHaveAttribute("data-paused", "false");
  const result = await scene.evaluate(async (element) => {
    // Native hidden tabs are not observable in this test runtime; fixture supplies only the visibility API signal.
    const descriptor = Object.getOwnPropertyDescriptor(document, "hidden");
    const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
    const clock = () => {
      const animation = element
        .querySelector(".forest-person")!
        .getAnimations()
        .find(
          (item) => (item as CSSAnimation).animationName === "forest-story",
        );
      if (!animation || typeof animation.currentTime !== "number") {
        throw new Error("Required story animation clock is missing");
      }
      return animation.currentTime;
    };
    let pausedStates: AnimationPlayState[] = [];
    let pausedAttribute: string | undefined;
    let stoppedAt = 0;
    let stillAt = 0;
    try {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      await wait();
      pausedAttribute = (element as HTMLElement).dataset.paused;
      pausedStates = element
        .getAnimations({ subtree: true })
        .map((item) => item.playState);
      stoppedAt = clock();
      await wait();
      stillAt = clock();
    } finally {
      if (descriptor) Object.defineProperty(document, "hidden", descriptor);
      else Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    }
    await wait();
    return {
      pausedStates,
      pausedAttribute,
      stoppedAt,
      stillAt,
      resumedAt: clock(),
      resumedAttribute: (element as HTMLElement).dataset.paused,
      resumedStates: element
        .getAnimations({ subtree: true })
        .map((item) => item.playState),
    };
  });
  expect(result.pausedAttribute).toBe("true");
  expect(result.pausedStates.length).toBeGreaterThan(0);
  expect(result.pausedStates.every((state) => state === "paused")).toBe(true);
  expect(result.stillAt).toBe(result.stoppedAt);
  expect(result.resumedAttribute).toBe("false");
  expect(result.resumedStates.length).toBeGreaterThan(0);
  expect(result.resumedStates.every((state) => state === "running")).toBe(true);
  expect(result.resumedAt).toBeGreaterThan(result.stillAt);
});
