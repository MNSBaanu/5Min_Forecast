import { test as base, expect, type Page } from "@playwright/test";

export const REP = {
  email: process.env.E2E_REP_EMAIL ?? "testsr@gmail.com",
  password: process.env.E2E_REP_PASSWORD ?? "Test@1234",
};

export const MANAGER = {
  email: process.env.E2E_MANAGER_EMAIL ?? "testsm@gmail.com",
  password: process.env.E2E_MANAGER_PASSWORD ?? "Test@1234",
};

export async function signIn(page: Page, creds: { email: string; password: string }) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).fill(creds.email);
  await page.getByLabel(/password/i).fill(creds.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });
}

export const test = base;
export { expect };