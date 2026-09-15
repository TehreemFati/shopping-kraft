import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import { uniqueSuffix } from "../helpers/env";

test.describe("Admin coupons", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("create and edit coupon", async ({ page }) => {
    const code = `E2E${uniqueSuffix().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    await page.goto("/admin/coupons/new");
    await page.getByLabel("Code").fill(code);
    await page.getByLabel("Value").fill("10");
    await page.getByLabel("Minimum Order").fill("500");
    await page.getByRole("button", { name: "Create Coupon" }).click();
    await expect(page).toHaveURL(/\/admin\/coupons/, { timeout: 30_000 });
    await expect(page.getByText(code)).toBeVisible();

    await page.getByRole("row", { name: new RegExp(code) }).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Value").fill("15");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/admin\/coupons/);
    await expect(page.getByText(code)).toBeVisible();
  });
});
