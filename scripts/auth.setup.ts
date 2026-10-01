import { test as setup, expect } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });

const authFile = "playwright/.auth/admin.json";
const ADMIN_EMAIL = "admin@demo.vegpro.local";
const ADMIN_PASSWORD = "DemoAdmin123!";

setup("authenticate as demo admin", async ({ request }) => {
  const csrfResponse = await request.get("/api/auth/csrf");
  expect(csrfResponse.ok()).toBeTruthy();
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };

  const signInResponse = await request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      callbackUrl: "/admin/analytics",
      json: "true",
    },
  });
  expect(signInResponse.ok()).toBeTruthy();

  const analyticsResponse = await request.get("/admin/analytics?days=7");
  expect(analyticsResponse.ok()).toBeTruthy();

  await request.storageState({ path: authFile });
});
