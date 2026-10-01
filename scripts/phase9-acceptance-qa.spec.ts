import { expect, test } from "@playwright/test";
import { buildFlowerPublicPath } from "@/lib/flower-public-url";

test.describe("Phase 9 — V1 release acceptance", () => {
  test("unauthenticated admin redirects to login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    await page.goto("/admin/flowers");
    await expect(page).toHaveURL(/\/login/);
    await context.close();
  });

  test("admin flower list and edit workflow", async ({ page }) => {
    await page.goto("/admin/flowers");
    await expect(page.getByRole("heading", { name: "Flower varieties" })).toBeVisible();
    await page.goto("/admin/flowers/VP-0001", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/VP-0001/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Explorer" }),
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: /Breeding/i }).click();
    await expect(page.getByText("Variety relationships")).toBeVisible();
  });

  test("public passport and public API boundary", async ({ page, request }) => {
    await page.goto("/flowers/VP-0001");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const api = await request.get("/api/public/flowers/VP-0001");
    expect(api.ok()).toBeTruthy();
    const json = JSON.stringify(await api.json());
    expect(json).not.toContain("breederNotesInternal");
    expect(json).not.toContain("Internal breeder note");
  });

  test("private passport is not publicly available", async ({ request }) => {
    const api = await request.get("/api/public/flowers/VP-9999");
    expect(api.status()).toBe(404);
  });

  test("stable QR endpoints", async ({ request }) => {
    const png = await request.get("/api/qr/VP-0001?format=png");
    expect(png.status()).toBe(200);
    expect(png.headers()["content-type"]).toContain("image/png");

    const svg = await request.get("/api/qr/VP-0001?format=svg");
    expect(svg.status()).toBe(200);
    expect(svg.headers()["content-type"]).toContain("image/svg+xml");

    expect(buildFlowerPublicPath("VP-0001")).toBe("/flowers/VP-0001");
  });

  test("analytics and integration admin surfaces", async ({ page }) => {
    await page.goto("/admin/analytics?days=7");
    await expect(page.getByRole("heading", { name: "Passport analytics" })).toBeVisible();

    await page.goto("/admin/integration");
    await expect(
      page.getByRole("heading", { level: 1, name: "Integration" }),
    ).toBeVisible();
    await expect(page.getByText(/not configured/i).first()).toBeVisible();
  });

  test.describe("Unauthenticated API", () => {
    test.use({ storageState: "playwright/.auth/empty.json" });

    test("integration sync requires authentication", async ({ request }) => {
      const response = await request.post("/api/integrations/sync", {
        data: { mode: "full", source: "VegPro" },
      });
      expect(response.status()).toBe(401);
    });
  });

  test("security headers present on public passport", async ({ request }) => {
    const response = await request.get("/flowers/VP-0001");
    expect(response.ok()).toBeTruthy();
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  });
});
