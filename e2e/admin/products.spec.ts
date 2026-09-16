import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import {
  createCategoryViaAdmin,
  createProductViaAdmin,
  softDeleteCategoryViaAdmin,
  softDeleteProductViaAdmin,
} from "../helpers/admin";
import { uniqueSuffix } from "../helpers/env";

test.describe("Admin products", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("list, create, and edit product", async ({ page }) => {
    const { name: categoryName } = await createCategoryViaAdmin(page);
    const { name } = await createProductViaAdmin(page, categoryName);
    let finalName = name;

    try {
      await page.goto("/admin/products");
      await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
      await expect(page.getByText(name)).toBeVisible();

      await page
        .getByRole("row")
        .filter({ hasText: name })
        .locator('a[href*="/edit"]')
        .click();
      await expect(
        page.getByRole("heading", { name: "Edit Product" }),
      ).toBeVisible();

      finalName = `${name} edit ${uniqueSuffix().slice(0, 4)}`;
      await page.getByLabel("Product Name").fill(finalName);
      await page.getByLabel("Price (PKR)").fill("2799");
      await page.getByRole("button", { name: "Save Product" }).click();
      await expect(page).toHaveURL(/\/admin\/products/);
      await expect(page.getByText(finalName)).toBeVisible();
    } finally {
      await softDeleteProductViaAdmin(page, finalName);
      await softDeleteCategoryViaAdmin(page, categoryName);
    }
  });
});
