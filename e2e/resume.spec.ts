import { expect, test } from "@playwright/test";

test("existing resume buttons use the canonical PDF address", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('a[href="/resume.pdf"]');
  await expect(links).toHaveCount(5);
  await expect(page.locator('a[href="/Saldana.Resume.pdf"]')).toHaveCount(0);
});
