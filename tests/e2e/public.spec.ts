import { test, expect } from "@playwright/test";

test.describe("public surface", () => {
  test("root shows the marketing landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /forecast you actually trust/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /start forecasting free/i })).toBeVisible();
  });

  test("sitemap.xml is served", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
  });

  test("robots.txt is served", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/User-agent/i);
  });
});