import { test, expect } from "@playwright/test";
import { MANAGER, signIn } from "./fixtures";

test.describe("sales manager", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MANAGER);
  });

  test("can open manager settings and see stage probabilities", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("body")).toContainText(/probability|stage/i, { timeout: 15_000 });
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test("analytics dashboard shows AI summary section", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("body")).toContainText(/ai|summary|insight|forecast/i, { timeout: 15_000 });
  });
});