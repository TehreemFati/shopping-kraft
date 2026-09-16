import { test, expect } from "@playwright/test";
import { loginAsCustomer } from "../helpers/auth";

test.describe("Storefront auth & account", () => {
  test("customer can open account dashboard pages", async ({ page }) => {
    await loginAsCustomer(page);

    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible();
    await expect(page.getByText(/^Hi,/)).toBeVisible();

    await page.goto("/account/orders");
    await expect(page.locator("h1, h2, table, p").first()).toBeVisible();

    await page.goto("/account/addresses");
    await expect(page.locator("h1, h2, p").first()).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).click();
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login form validation surfaces for bad credentials", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(`nobody-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(
      page.getByText(/invalid|failed|error|credentials/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
