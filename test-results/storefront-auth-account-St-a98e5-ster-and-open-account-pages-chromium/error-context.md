# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront/auth-account.spec.ts >> Storefront auth & account >> register and open account pages
- Location: e2e/storefront/auth-account.spec.ts:6:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:3000/register"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Shopping Kraft" [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e6]:
        - link "Search" [ref=e7] [cursor=pointer]:
          - /url: /search
        - link "Account" [ref=e11] [cursor=pointer]:
          - /url: /login
        - link "Cart" [ref=e15] [cursor=pointer]:
          - /url: /cart
        - button "Open menu" [ref=e19]
  - main [ref=e21]:
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: Create Account
        - generic [ref=e26]: Register to track orders and save addresses
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]: Full Name
            - textbox "Full Name" [ref=e31]: E2E Customer 1789367973650-jytjn4
          - generic [ref=e32]:
            - generic [ref=e33]: Email
            - textbox "Email" [ref=e34]: e2e-customer-1789367973650-jytjn4@example.com
          - generic [ref=e35]:
            - generic [ref=e36]: Password
            - textbox "Password" [ref=e37]: TestPass123!
          - generic [ref=e38]:
            - generic [ref=e39]: Confirm Password
            - textbox "Confirm Password" [ref=e40]: TestPass123!
          - button "Register" [ref=e41]
        - paragraph [ref=e42]:
          - text: Already have an account?
          - link "Sign In" [ref=e43] [cursor=pointer]:
            - /url: /login
  - contentinfo [ref=e44]:
    - generic [ref=e46]:
      - generic [ref=e47]:
        - generic [ref=e48]:
          - paragraph [ref=e49]: Shopping Kraft
          - paragraph [ref=e50]: Good gifts for good relations — curated hampers and custom wooden baskets, delivered across Pakistan.
        - generic [ref=e51]:
          - heading "Explore" [level=4] [ref=e52]
          - list [ref=e53]:
            - listitem [ref=e54]:
              - link "Full catalog" [ref=e55] [cursor=pointer]:
                - /url: /shop
            - listitem [ref=e56]:
              - link "Search" [ref=e57] [cursor=pointer]:
                - /url: /search
            - listitem [ref=e58]:
              - link "Bag" [ref=e59] [cursor=pointer]:
                - /url: /cart
        - generic [ref=e60]:
          - heading "Account" [level=4] [ref=e61]
          - list [ref=e62]:
            - listitem [ref=e63]:
              - link "My account" [ref=e64] [cursor=pointer]:
                - /url: /account
            - listitem [ref=e65]:
              - link "Orders" [ref=e66] [cursor=pointer]:
                - /url: /account/orders
            - listitem [ref=e67]:
              - link "Sign in" [ref=e68] [cursor=pointer]:
                - /url: /login
        - generic [ref=e69]:
          - heading "Contact" [level=4] [ref=e70]
          - paragraph [ref=e71]: hello@shoppingkraft.com+92 313 5009138Shop F111, 1st floor, Rabi Saddar, Adamjee Road, Saddar Rawalpindi
          - list [ref=e72]:
            - listitem [ref=e73]:
              - link "Instagram" [ref=e74] [cursor=pointer]:
                - /url: https://www.instagram.com/shoppingkraft/
            - listitem [ref=e75]:
              - link "Facebook" [ref=e76] [cursor=pointer]:
                - /url: https://www.facebook.com/ShopKraft/
            - listitem [ref=e77]:
              - link "TikTok" [ref=e78] [cursor=pointer]:
                - /url: https://www.tiktok.com/@shoppingkraft
      - generic [ref=e79]:
        - paragraph [ref=e80]: © 2026 Shopping Kraft
        - paragraph [ref=e81]: Crafted for Pakistan · Fast nationwide delivery
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e87] [cursor=pointer]
  - alert [ref=e91]
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | import { adminCredentials, customerCredentials, uniqueSuffix } from "./env";
  3  | 
  4  | export async function login(page: Page, email: string, password: string, redirectTo?: string) {
  5  |   const path = redirectTo
  6  |     ? `/login?redirect=${encodeURIComponent(redirectTo)}`
  7  |     : "/login";
  8  |   await page.goto(path);
  9  |   await page.getByLabel("Email").fill(email);
  10 |   await page.getByLabel("Password").fill(password);
  11 |   await page.getByRole("button", { name: "Sign In" }).click();
  12 | }
  13 | 
  14 | export async function loginAsAdmin(page: Page) {
  15 |   const { email, password } = adminCredentials();
  16 |   await login(page, email, password, "/admin");
  17 |   await page.waitForURL(/\/admin/, { timeout: 30_000 });
  18 |   await page.getByRole("link", { name: "Admin Panel" }).waitFor({
  19 |     state: "visible",
  20 |     timeout: 30_000,
  21 |   });
  22 | }
  23 | 
  24 | export async function loginAsCustomer(page: Page) {
  25 |   const existing = customerCredentials();
  26 |   if (existing) {
  27 |     await login(page, existing.email, existing.password);
  28 |     await page.waitForURL((url) => !url.pathname.includes("/login"), {
  29 |       timeout: 30_000,
  30 |     });
  31 |     return existing;
  32 |   }
  33 | 
  34 |   const suffix = uniqueSuffix();
  35 |   const email = `e2e-customer-${suffix}@example.com`;
  36 |   const password = "TestPass123!";
  37 |   await page.goto("/register");
  38 |   await page.getByLabel("Full Name").fill(`E2E Customer ${suffix}`);
  39 |   await page.getByLabel("Email").fill(email);
  40 |   await page.getByLabel("Password", { exact: true }).fill(password);
  41 |   await page.getByLabel("Confirm Password").fill(password);
  42 |   await page.getByRole("button", { name: "Register" }).click();
> 43 |   await page.waitForURL((url) => !url.pathname.includes("/register"), {
     |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  44 |     timeout: 30_000,
  45 |   });
  46 |   return { email, password };
  47 | }
  48 | 
  49 | export async function logoutFromAdmin(page: Page) {
  50 |   await page.getByRole("button", { name: "Logout" }).click();
  51 |   await page.waitForURL((url) => !url.pathname.startsWith("/admin"), {
  52 |     timeout: 15_000,
  53 |   });
  54 | }
  55 | 
```