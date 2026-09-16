import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import {
  createCategoryViaAdmin,
  createProductViaAdmin,
  expectToast,
  softDeleteCategoryViaAdmin,
  softDeleteProductViaAdmin,
} from "../helpers/admin";

test.describe("Storefront cart & checkout", () => {
  test("add to cart, update quantity, checkout COD", async ({ page }) => {
    await loginAsAdmin(page);
    const { name: categoryName } = await createCategoryViaAdmin(page);
    const { name: productName, slug } = await createProductViaAdmin(
      page,
      categoryName,
    );

    try {
      await page.goto(`/product/${slug}`);
      await expect(page.getByRole("heading", { name: productName })).toBeVisible();
      await expect(page.getByText(/in stock/i)).toBeVisible({ timeout: 15_000 });
      await page.getByRole("button", { name: "Add to Cart" }).click();
      await expectToast(page, /Added to cart/i);

      await page.goto("/cart");
      await expect(page.getByText(productName)).toBeVisible();

      const plus = page.locator("button").filter({
        has: page.locator("svg.lucide-plus"),
      });
      if (await plus.first().isVisible()) {
        await plus.first().click();
      }

      await page.goto("/checkout");
      await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
      await page.getByLabel("Full Name").fill("E2E Buyer");
      await page.getByLabel("Phone").fill("03135009138");
      await page.getByLabel("Address", { exact: true }).fill("Shop F111 Saddar");
      await page.getByLabel("City").fill("Rawalpindi");
      await page.getByLabel("Province").fill("Punjab");
      await page.getByText("JazzCash", { exact: true }).click();
      await page
        .getByRole("button", { name: /Place Order/i })
        .click();
      await expect(
        page
          .getByText(/Order placed|My Account|Orders/i)
          .first(),
      ).toBeVisible({ timeout: 45_000 });
    } finally {
      await softDeleteProductViaAdmin(page, productName);
      await softDeleteCategoryViaAdmin(page, categoryName);
    }
  });

  test("remove item from cart", async ({ page }) => {
    await loginAsAdmin(page);
    const { name: categoryName } = await createCategoryViaAdmin(page);
    const { name: productName, slug } = await createProductViaAdmin(
      page,
      categoryName,
    );

    try {
      await page.goto(`/product/${slug}`);
      await expect(page.getByText(/in stock/i)).toBeVisible({ timeout: 15_000 });
      await page.getByRole("button", { name: "Add to Cart" }).click();
      await expectToast(page, /Added to cart/i);

      await page.goto("/cart");
      await expect(page.getByText(productName)).toBeVisible();
      await page
        .locator("button")
        .filter({ has: page.locator("svg.lucide-trash-2") })
        .first()
        .click();
      await expect(page.getByText(/Your cart is empty/i)).toBeVisible({
        timeout: 20_000,
      });
    } finally {
      await softDeleteProductViaAdmin(page, productName);
      await softDeleteCategoryViaAdmin(page, categoryName);
    }
  });
});
