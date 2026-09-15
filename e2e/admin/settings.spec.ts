import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import { expectToast } from "../helpers/admin";

test.describe("Admin settings", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("save store settings", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(
      page.getByRole("heading", { name: /Store Settings|Settings/i }),
    ).toBeVisible();

    await page.getByLabel("Contact Phone").fill("+92 313 5009138");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expectToast(page, /Settings saved/i);
  });
});
