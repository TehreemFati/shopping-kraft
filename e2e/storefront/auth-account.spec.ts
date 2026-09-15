import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";
import { adminCredentials, uniqueSuffix } from "../helpers/env";

test.describe("Storefront auth & account", () => {
  test("registered or existing user can open account pages", async ({
    page,
  }) => {
    // Prefer fresh register; if Supabase blocks signup (email confirm), fall back to admin.
    const suffix = uniqueSuffix();
    const email = `e2e-customer-${suffix}@example.com`;
    const password = "TestPass123!";
    await page.goto("/register");
    await page.getByLabel("Full Name").fill(`E2E Customer ${suffix}`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm Password").fill(password);
    await page.getByRole("button", { name: "Register" }).click();

    await page.waitForTimeout(3000);
    if (page.url().includes("/register")) {
      const { email: adminEmail, password: adminPassword } = adminCredentials();
      await login(page, adminEmail, adminPassword, "/account");
    }

    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible();

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
    await page.getByLabel("Email").fill(`nobody-${uniqueSuffix()}@example.com`);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(
      page.getByText(/invalid|failed|error|credentials/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
