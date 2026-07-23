import { test, expect } from "@playwright/test";
import { REP, signIn } from "./fixtures";

test.describe("authenticated navigation (sales rep)", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, REP);
  });

  const pages: Array<{ path: string; heading: RegExp }> = [
    { path: "/pipeline", heading: /pipeline/i },
    { path: "/analytics", heading: /analytics|forecast|pipeline/i },
    { path: "/contacts", heading: /contacts|people|companies/i },
    { path: "/import", heading: /import|upload|csv/i },
  ];

  for (const { path, heading } of pages) {
    test(`renders ${path} without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.goto(path);
      await expect(page.getByRole("main").first()).toContainText(heading, { timeout: 15_000 });
      expect(errors, `pageerror on ${path}: ${errors.join(", ")}`).toEqual([]);
    });
  }

  test("settings route is restricted for sales reps", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const bodyText = await page.locator("body").innerText();
    const denied = /not authorized|forbidden|manager|access|only/i.test(bodyText) || !url.endsWith("/settings");
    expect(denied).toBeTruthy();
  });
});