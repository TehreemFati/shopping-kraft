# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin/orders.spec.ts >> Admin orders >> order detail opens when an order exists
- Location: e2e/admin/orders.spec.ts:14:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/admin\/orders\/.+/
Received string:  "http://localhost:3000/admin/reviews"
Timeout: 20000ms

Call log:
  - Expect "toHaveURL" with timeout 20000ms
    7 × locator resolved to <html lang="en" class="fraunces_b202e7d9-module__YSVETG__variable outfit_a781b69a-module__ZHXJlW__variable h-full antialiased">…</html>
      - unexpected value "http://localhost:3000/admin/orders"
    36 × locator resolved to <html lang="en" class="fraunces_b202e7d9-module__YSVETG__variable outfit_a781b69a-module__ZHXJlW__variable h-full antialiased">…</html>
       - unexpected value "http://localhost:3000/admin/reviews"

```

```yaml
- complementary:
  - link "Admin Panel":
    - /url: /admin
  - navigation:
    - link "Dashboard":
      - /url: /admin
    - link "Products":
      - /url: /admin/products
    - link "Categories":
      - /url: /admin/categories
    - link "Orders":
      - /url: /admin/orders
    - link "Customers":
      - /url: /admin/customers
    - link "Inventory":
      - /url: /admin/inventory
    - link "Coupons":
      - /url: /admin/coupons
    - link "Sales":
      - /url: /admin/sales
    - link "Reviews":
      - /url: /admin/reviews
    - link "Banners":
      - /url: /admin/banners
    - link "Staff":
      - /url: /admin/staff
    - link "Settings":
      - /url: /admin/settings
  - link "View Store":
    - /url: /
  - button "Logout"
- main:
  - heading "Reviews" [level=1]
  - text: Search
  - textbox "Search":
    - /placeholder: Product, customer, comment…
  - text: Status
  - combobox "Status":
    - option "All statuses" [selected]
    - option "Approved"
    - option "Pending"
  - text: Rating
  - combobox "Rating":
    - option "All ratings" [selected]
    - option "5 stars"
    - option "4 stars"
    - option "3 stars"
    - option "2 stars"
    - option "1 star"
  - button "Apply"
  - paragraph: No reviews found.
- region "Notifications alt+T"
- alert: Reviews
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsAdmin } from "../helpers/auth";
  3  | 
  4  | test.describe("Admin orders", () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await loginAsAdmin(page);
  7  |   });
  8  | 
  9  |   test("orders list loads", async ({ page }) => {
  10 |     await page.goto("/admin/orders");
  11 |     await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  12 |   });
  13 | 
  14 |   test("order detail opens when an order exists", async ({ page }) => {
  15 |     await page.goto("/admin/orders");
  16 |     const editLink = page.getByRole("link", { name: /View|Edit|Details/i }).first();
  17 |     const rowLink = page.locator("table a").first();
  18 |     if (await rowLink.count()) {
  19 |       await rowLink.click();
  20 |       await expect(page).toHaveURL(/\/admin\/orders\/.+/);
  21 |       await expect(page.locator("h1, h2").first()).toBeVisible();
  22 |     } else if (await editLink.count()) {
  23 |       await editLink.click();
> 24 |       await expect(page).toHaveURL(/\/admin\/orders\/.+/);
     |                          ^ Error: expect(page).toHaveURL(expected) failed
  25 |     } else {
  26 |       test.info().annotations.push({
  27 |         type: "note",
  28 |         description: "No orders yet — list-only assertion passed",
  29 |       });
  30 |     }
  31 |   });
  32 | });
  33 | 
```