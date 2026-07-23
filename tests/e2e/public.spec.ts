import { test, expect } from "@playwright/test";

test.describe("public surface", () => {
  test("root redirects unauthenticated users to /auth", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/auth/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /welcome back|sign in/i })).toBeVisible();
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