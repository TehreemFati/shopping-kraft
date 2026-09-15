import type { Page } from "@playwright/test";
import { adminCredentials, customerCredentials, uniqueSuffix } from "./env";

export async function login(page: Page, email: string, password: string, redirectTo?: string) {
  const path = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";
  await page.goto(path);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

export async function loginAsAdmin(page: Page) {
  const { email, password } = adminCredentials();
  await login(page, email, password, "/admin");
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
  await page.getByRole("link", { name: "Admin Panel" }).waitFor({
    state: "visible",
    timeout: 30_000,
  });
}

export async function loginAsCustomer(page: Page) {
  const existing = customerCredentials();
  if (existing) {
    await login(page, existing.email, existing.password);
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 30_000,
    });
    return existing;
  }

  const suffix = uniqueSuffix();
  const email = `e2e-customer-${suffix}@example.com`;
  const password = "TestPass123!";
  await page.goto("/register");
  await page.getByLabel("Full Name").fill(`E2E Customer ${suffix}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm Password").fill(password);
  await page.getByRole("button", { name: "Register" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/register"), {
    timeout: 30_000,
  });
  return { email, password };
}

export async function logoutFromAdmin(page: Page) {
  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/admin"), {
    timeout: 15_000,
  });
}
