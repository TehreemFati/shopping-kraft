import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import {
  createCategoryViaAdmin,
  createProductViaAdmin,
  softDeleteCategoryViaAdmin,
  softDeleteProductViaAdmin,
} from "../helpers/admin";
import { uniqueSuffix } from "../helpers/env";

test.describe("Admin sales", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("create sale campaign with product", async ({ page }) => {
    const { name: categoryName } = await createCategoryViaAdmin(page);
    const { name: productName } = await createProductViaAdmin(
      page,
      categoryName,
    );

    const saleName = `E2E Flash Sale ${uniqueSuffix()}`;
    try {
      await page.goto("/admin/sales/new");
      await page.getByLabel("Name").fill(saleName);
      await page.locator("#sale_type").selectOption("flash");

      const start = new Date();
      start.setMinutes(start.getMinutes() - 10);
      const end = new Date();
      end.setDate(end.getDate() + 7);
      const toLocal = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      await page.getByLabel("Starts at").fill(toLocal(start));
      await page.getByLabel("Ends at").fill(toLocal(end));
      await page.getByLabel("Description").fill("E2E sale campaign");

      const productRow = page
        .locator("div.flex.flex-wrap.items-center")
        .filter({ hasText: productName });
      await productRow.locator('[data-slot="checkbox"]').click();

      await page.getByRole("button", { name: "Create sale" }).click();
      await expect(page).toHaveURL(/\/admin\/sales/, { timeout: 30_000 });
      await expect(page.getByText(saleName)).toBeVisible();
    } finally {
      await softDeleteProductViaAdmin(page, productName);
      await softDeleteCategoryViaAdmin(page, categoryName);
    }
  });
});
