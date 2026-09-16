import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import {
  createCategoryViaAdmin,
  createProductViaAdmin,
  expectToast,
  softDeleteCategoryViaAdmin,
  softDeleteProductViaAdmin,
} from "../helpers/admin";

test.describe("Admin inventory", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("list inventory and adjust stock", async ({ page }) => {
    const { name: categoryName } = await createCategoryViaAdmin(page);
    const { name } = await createProductViaAdmin(page, categoryName);

    try {
      await page.goto("/admin/inventory");
      await expect(
        page.getByRole("heading", { name: "Inventory" }),
      ).toBeVisible();
      await expect(page.getByText(name)).toBeVisible();

      const row = page.getByRole("row", { name: new RegExp(name) });
      await row.getByRole("button", { name: "Adjust" }).click();
      await row.locator('input[type="number"]').fill("40");
      await row.getByRole("button", { name: "Save" }).click();
      await expectToast(page, /Stock updated/i);
      await expect(row.getByText("40")).toBeVisible();
    } finally {
      await softDeleteProductViaAdmin(page, name);
      await softDeleteCategoryViaAdmin(page, categoryName);
    }
  });
});
