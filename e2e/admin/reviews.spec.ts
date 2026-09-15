import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";

test.describe("Admin reviews", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("reviews list loads", async ({ page }) => {
    await page.goto("/admin/reviews");
    await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
  });
});
