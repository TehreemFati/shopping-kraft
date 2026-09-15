import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import {
  createCategoryViaAdmin,
  createProductViaAdmin,
} from "../helpers/admin";

test.describe("Storefront home & browse", () => {
  test("homepage shows brand and why section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Shopping Kraft").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Good gifts for good relations/i }),
    ).toBeVisible();
    await expect(page.getByText("+92 313 5009138")).toBeVisible();
    await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();
  });

  test("shop page loads", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: /Shop|Catalog|Products/i }).or(page.locator("h1")).first()).toBeVisible();
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1, form").first()).toBeVisible();
  });

  test("category and product pages from admin-created catalog", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const { name: categoryName, slug: categorySlug } =
      await createCategoryViaAdmin(page);
    const { name: productName, slug: productSlug } =
      await createProductViaAdmin(page, categoryName);

    await page.goto(`/category/${categorySlug}`);
    await expect(page.getByRole("heading", { name: categoryName })).toBeVisible();
    await expect(page.getByText(productName).first()).toBeVisible();

    await page.goto(`/product/${productSlug}`);
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();
    await expect(page.getByText(/Rs|PKR|1,?999|2,?499/i).first()).toBeVisible();
  });
});
