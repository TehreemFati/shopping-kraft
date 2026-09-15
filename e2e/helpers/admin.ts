import path from "node:path";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { uniqueSuffix } from "./env";

export const FIXTURE_IMAGE = path.join(__dirname, "../fixtures/product.png");

export async function selectByLabel(
  page: Page,
  labelText: string,
  option: string,
) {
  const group = page.locator("div.space-y-2").filter({
    has: page.getByText(labelText, { exact: true }),
  });
  await group.getByRole("combobox").click();
  await page.getByRole("option", { name: option }).click();
}

export async function uploadFixtureImage(page: Page) {
  await page
    .locator('[data-testid="image-upload-input"]')
    .setInputFiles(FIXTURE_IMAGE);
  await expect(page.locator('img[alt=""]').first()).toBeVisible({
    timeout: 45_000,
  });
}

export async function createCategoryViaAdmin(
  page: Page,
  name?: string,
): Promise<{ name: string; slug: string }> {
  const suffix = uniqueSuffix();
  const categoryName = name ?? `E2E Gift Baskets ${suffix}`;
  await page.goto("/admin/categories/new");
  await page.getByLabel("Name").fill(categoryName);
  await expect(page.locator("#slug")).not.toHaveValue("", { timeout: 5_000 });
  const slug = await page.locator("#slug").inputValue();
  await page
    .getByLabel("Description")
    .fill("E2E gift category for Shopping Kraft");
  await uploadFixtureImage(page);
  await page.getByRole("button", { name: /Create Category|Save/i }).click();
  await expect(page).toHaveURL(/\/admin\/categories/, { timeout: 30_000 });
  await expect(page.getByText(categoryName)).toBeVisible();
  return { name: categoryName, slug };
}

export async function createProductViaAdmin(
  page: Page,
  categoryName: string,
  productName?: string,
): Promise<{ name: string; slug: string }> {
  const suffix = uniqueSuffix();
  const name = productName ?? `E2E Baby Boy Wooden Basket ${suffix}`;
  await page.goto("/admin/products/new");
  await page.getByLabel("Product Name").fill(name);
  await expect(page.locator("#slug")).not.toHaveValue("", { timeout: 5_000 });
  const slug = await page.locator("#slug").inputValue();
  await selectByLabel(page, "Category", categoryName);
  await page.getByLabel("Price (PKR)").fill("2499");
  await page.getByLabel("Sale Price").fill("1999");
  await page.getByLabel("SKU").fill(`E2E-${suffix}`);
  await page.getByLabel("Stock").fill("25");
  await page
    .getByLabel("Description")
    .fill(
      "Customisable baby boy wooden gift basket. Delivery across Pakistan.",
    );
  await uploadFixtureImage(page);
  await page.getByRole("button", { name: /Save Product|Save/i }).click();
  await expect(page).toHaveURL(/\/admin\/products/, { timeout: 30_000 });
  await expect(page.getByText(name)).toBeVisible();
  return { name, slug };
}

export async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 20_000 });
}
