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

async function idFromEditHref(page: Page, name: string, kind: "categories" | "products") {
  const href = await page
    .getByRole("row")
    .filter({ hasText: name })
    .locator(`a[href*="/admin/${kind}/"][href*="/edit"]`)
    .getAttribute("href");
  const match = href?.match(new RegExp(`/admin/${kind}/([^/]+)/edit`));
  if (!match?.[1]) {
    throw new Error(`Could not resolve ${kind} id for "${name}"`);
  }
  return match[1];
}

export async function createCategoryViaAdmin(
  page: Page,
  name?: string,
): Promise<{ id: string; name: string; slug: string }> {
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
  const id = await idFromEditHref(page, categoryName, "categories");
  return { id, name: categoryName, slug };
}

export async function createProductViaAdmin(
  page: Page,
  categoryName: string,
  productName?: string,
): Promise<{ id: string; name: string; slug: string }> {
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
  const id = await idFromEditHref(page, name, "products");
  return { id, name, slug };
}

async function softDeleteRowByName(
  page: Page,
  listPath: string,
  name: string,
) {
  await page.goto(listPath);
  const row = page.getByRole("row").filter({ hasText: name });
  if ((await row.count()) === 0) return;
  page.once("dialog", (d) => d.accept());
  await row
    .locator("button")
    .filter({ has: page.locator("svg.lucide-trash-2") })
    .click();
  await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(0, {
    timeout: 20_000,
  });
}

export async function softDeleteProductViaAdmin(page: Page, name: string) {
  await softDeleteRowByName(page, "/admin/products", name);
}

export async function softDeleteCategoryViaAdmin(page: Page, name: string) {
  await softDeleteRowByName(page, "/admin/categories", name);
}

export async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 20_000 });
}
