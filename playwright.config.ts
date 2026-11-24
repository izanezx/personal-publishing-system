import { defineConfig, devices } from "@playwright/test";

const base = (process.env.SITE_BASE_PATH ?? "/").replace(/\/$/, "");

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  reporter: process.env.CI ? [["dot"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4399",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm preview --ignore-lock --host 127.0.0.1 --port 4399",
    url: `http://127.0.0.1:4399${base}/`,
    reuseExistingServer: !process.env.CI,
  },
});
