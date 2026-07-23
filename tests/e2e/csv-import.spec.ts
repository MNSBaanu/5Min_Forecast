import { test, expect } from "@playwright/test";
import { REP, signIn } from "./fixtures";

const CSV_VALID = `Company,Contact,Value,Stage,Close Date,Owner
Acme Corp,Jane Doe,25000,Proposal,2026-12-31,rep@example.com
Globex,John Roe,10000,Lead,2027-01-15,rep@example.com
`;

const CSV_MESSY = `Company,Contact,Value,Stage,Close Date,Owner
Broken Co,,not-a-number,UnknownStage,not-a-date,rep@example.com
Good Co,Jane,5000,Lead,2026-11-01,rep@example.com
`;

test.describe("csv import", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, REP);
    await page.goto("/import");
  });

  test("upload surfaces columns for mapping", async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
      name: "deals.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(CSV_VALID),
    });
    await expect(page.locator("body")).toContainText(/company/i, { timeout: 15_000 });
    await expect(page.locator("body")).toContainText(/stage/i);
  });

  test("messy csv shows validation feedback", async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
      name: "messy.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(CSV_MESSY),
    });
    const next = page.getByRole("button", { name: /next|preview|continue/i });
    if (await next.first().isVisible().catch(() => false)) {
      await next.first().click();
    }
    await expect(page.locator("body")).toContainText(/invalid|error|row|skip/i, { timeout: 15_000 });
  });
});