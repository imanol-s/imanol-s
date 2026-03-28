/**
 * Visual smoke test for the gaussian brightness sweep.
 * Takes three screenshots at t=2s, t=17s, t=35s to verify the sweep
 * is at different positions across the viewport.
 *
 * Usage: npx playwright test tests/visual-smoke.mjs
 *   or:  node tests/visual-smoke.mjs  (requires playwright installed)
 */
import { chromium } from "playwright";

const TIMESTAMPS = [2000, 17000, 35000];
const URL = process.env.SMOKE_URL || "http://localhost:4321";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(URL, { waitUntil: "networkidle" });

  for (const ms of TIMESTAMPS) {
    await page.waitForTimeout(ms === TIMESTAMPS[0] ? ms : ms - TIMESTAMPS[TIMESTAMPS.indexOf(ms) - 1]);
    const name = `sweep-t${ms / 1000}s.png`;
    await page.screenshot({ path: name, fullPage: false });
    console.log(`✓ ${name}`);
  }

  await browser.close();
  console.log("Done — compare the three screenshots to verify sweep position differs.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
