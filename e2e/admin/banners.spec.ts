import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import { uploadFixtureImage } from "../helpers/admin";
import { uniqueSuffix } from "../helpers/env";

test.describe("Admin banners", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("create and edit banner", async ({ page }) => {
    const title = `E2E Good Gifts ${uniqueSuffix()}`;
    await page.goto("/admin/banners/new");
    await page.locator("#title").fill(title);
    await page.locator("#subtitle").fill("Good gifts for good relations");
    await page.locator("#link_url").fill("/shop");
    await uploadFixtureImage(page);
    await page.getByRole("button", { name: "Create banner" }).click();
    await expect(page).toHaveURL(/\/admin\/banners/, { timeout: 45_000 });
    await expect(page.getByText(title)).toBeVisible();

    await page
      .getByRole("row")
      .filter({ hasText: title })
      .getByRole("link", { name: "Edit" })
      .click();
    const updated = `${title} updated`;
    await page.locator("#title").fill(updated);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/admin\/banners/);
    await expect(page.getByText(updated)).toBeVisible();
  });
});
