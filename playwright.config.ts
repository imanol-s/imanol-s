import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4321/",
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:4321/",
    screenshot: "on",
    trace: "retain-on-failure",
  },
  reporter: [["html", { open: "on-failure" }], ["list"]],
  testDir: "e2e",
  outputDir: "test-results",
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
