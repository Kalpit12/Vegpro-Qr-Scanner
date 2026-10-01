import { config as loadEnv } from "dotenv";
import { defineConfig } from "@playwright/test";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

export default defineConfig({
  testDir: "./scripts",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:5001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:5001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      AUTH_URL: process.env.AUTH_URL ?? "http://localhost:5001",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:5001",
    },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "phase6",
      testMatch: /phase6-acceptance-qa\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        storageState: "playwright/.auth/admin.json",
      },
    },
    {
      name: "phase9",
      testMatch: /phase9-acceptance-qa\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        storageState: "playwright/.auth/admin.json",
      },
    },
  ],
  reporter: [["list"]],
});
