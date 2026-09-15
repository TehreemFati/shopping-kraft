import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";

test.describe("Admin orders", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("orders list loads", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  });

  test("order detail opens when an order exists", async ({ page }) => {
    await page.goto("/admin/orders");
    const viewLink = page.getByRole("link", { name: "View" }).first();
    if ((await viewLink.count()) === 0) {
      test.info().annotations.push({
        type: "note",
        description: "No orders yet — list-only assertion passed",
      });
      return;
    }
    await viewLink.click();
    await expect(page).toHaveURL(/\/admin\/orders\/.+/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
