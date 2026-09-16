import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import {
  createCategoryViaAdmin,
  softDeleteCategoryViaAdmin,
} from "../helpers/admin";
import { uniqueSuffix } from "../helpers/env";

test.describe("Admin categories", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("list, create, and edit category", async ({ page }) => {
    const { name } = await createCategoryViaAdmin(page);
    let finalName = name;

    try {
      await page.goto("/admin/categories");
      await expect(
        page.getByRole("heading", { name: "Categories" }),
      ).toBeVisible();
      await expect(page.getByText(name)).toBeVisible();

      await page
        .getByRole("row")
        .filter({ hasText: name })
        .getByRole("link", { name: "Edit" })
        .click();
      await expect(
        page.getByRole("heading", { name: "Edit Category" }),
      ).toBeVisible();

      finalName = `${name} updated ${uniqueSuffix().slice(0, 6)}`;
      await page.getByLabel("Name").fill(finalName);
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page).toHaveURL(/\/admin\/categories/);
      await expect(page.getByText(finalName)).toBeVisible();
    } finally {
      await softDeleteCategoryViaAdmin(page, finalName);
    }
  });
});
