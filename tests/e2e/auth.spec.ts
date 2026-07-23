import { test, expect } from "@playwright/test";
import { REP, signIn } from "./fixtures";

test("sales rep can sign in and land in the app", async ({ page }) => {
  await signIn(page, REP);
  await expect(page.getByRole("link", { name: /pipeline/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /analytics/i }).first()).toBeVisible();
});

test("invalid credentials show an inline error", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel(/email/i).fill("nobody@example.com");
  await page.getByLabel(/password/i).fill("wrong-password-xyz");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page.locator("body")).toContainText(/invalid|credentials|incorrect/i, { timeout: 15_000 });
});