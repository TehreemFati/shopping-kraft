import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import { uniqueSuffix } from "../helpers/env";

test.describe("Admin staff", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("create staff member", async ({ page }) => {
    const suffix = uniqueSuffix();
    const email = `e2e-staff-${suffix}@example.com`;
    await page.goto("/admin/staff/new");
    await page.getByLabel("Full name").fill(`E2E Staff ${suffix}`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Temporary password").fill("StaffPass123!");
    await page.getByRole("button", { name: "Create staff" }).click();
    await expect(page).toHaveURL(/\/admin\/staff/, { timeout: 45_000 });
    await expect(page.getByRole("cell", { name: `E2E Staff ${suffix}` })).toBeVisible();
  });
});
