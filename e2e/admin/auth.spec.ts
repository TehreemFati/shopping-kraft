import { test, expect } from "@playwright/test";
import { loginAsAdmin, logoutFromAdmin } from "../helpers/auth";

test.describe("Admin auth", () => {
  test("unauthenticated visit to /admin redirects to login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("redirect");
  });

  test("admin can sign in and open dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  });

  test("admin can logout", async ({ page }) => {
    await loginAsAdmin(page);
    await logoutFromAdmin(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
