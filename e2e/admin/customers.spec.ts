import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";

test.describe("Admin customers", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("customers list loads", async ({ page }) => {
    await page.goto("/admin/customers");
    await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  });

  test("customer detail opens when a customer exists", async ({ page }) => {
    await page.goto("/admin/customers");
    const link = page.locator("table a").first();
    if (await link.count()) {
      await link.click();
      await expect(page).toHaveURL(/\/admin\/customers\/.+/);
    }
  });
});
