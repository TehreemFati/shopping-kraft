# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin/banners.spec.ts >> Admin banners >> create and edit banner
- Location: e2e/admin/banners.spec.ts:11:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Title') resolved to 2 elements:
    1) <input id="title" required="" name="title" data-slot="input" class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 ar…/> aka getByRole('textbox', { name: 'Title', exact: true })
    2) <input value="" id="subtitle" name="subtitle" data-slot="input" class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50…/> aka getByRole('textbox', { name: 'Subtitle' })

Call log:
  - waiting for getByLabel('Title')

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e2]:
    - complementary [ref=f1e3]:
      - link "Admin Panel" [ref=f1e5] [cursor=pointer]:
        - /url: /admin
      - navigation [ref=f1e6]:
        - link "Dashboard" [ref=f1e7] [cursor=pointer]:
          - /url: /admin
        - link "Products" [ref=f1e13] [cursor=pointer]:
          - /url: /admin/products
        - link "Categories" [ref=f1e18] [cursor=pointer]:
          - /url: /admin/categories
        - link "Orders" [ref=f1e24] [cursor=pointer]:
          - /url: /admin/orders
        - link "Customers" [ref=f1e30] [cursor=pointer]:
          - /url: /admin/customers
        - link "Inventory" [ref=f1e36] [cursor=pointer]:
          - /url: /admin/inventory
        - link "Coupons" [ref=f1e40] [cursor=pointer]:
          - /url: /admin/coupons
        - link "Sales" [ref=f1e43] [cursor=pointer]:
          - /url: /admin/sales
        - link "Reviews" [ref=f1e48] [cursor=pointer]:
          - /url: /admin/reviews
        - link "Banners" [ref=f1e51] [cursor=pointer]:
          - /url: /admin/banners
        - link "Staff" [ref=f1e56] [cursor=pointer]:
          - /url: /admin/staff
        - link "Settings" [ref=f1e69] [cursor=pointer]:
          - /url: /admin/settings
      - generic [ref=f1e73]:
        - link "View Store" [ref=f1e74] [cursor=pointer]:
          - /url: /
        - button "Logout" [ref=f1e76]
    - main [ref=f1e77]:
      - generic [ref=f1e78]:
        - heading "Add Banner" [level=1] [ref=f1e79]
        - generic [ref=f1e80]:
          - generic [ref=f1e81]: Add Banner
          - generic [ref=f1e84]:
            - generic [ref=f1e85]:
              - generic [ref=f1e86]: Title
              - textbox "Title" [ref=f1e87]
            - generic [ref=f1e88]:
              - generic [ref=f1e89]: Subtitle
              - textbox "Subtitle" [ref=f1e90]
            - generic [ref=f1e91]:
              - generic [ref=f1e92]: Image
              - generic [ref=f1e93]: Upload Images
            - generic [ref=f1e96]:
              - generic [ref=f1e97]: Link URL
              - textbox "Link URL" [ref=f1e98]
            - generic [ref=f1e99]:
              - generic [ref=f1e100]: Sort order
              - spinbutton "Sort order" [ref=f1e101]: "0"
            - generic [ref=f1e102]:
              - button "Create banner" [disabled]
              - link "Cancel" [ref=f1e103] [cursor=pointer]:
                - /url: /admin/banners
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=f1e109] [cursor=pointer]
  - alert [ref=f1e113]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsAdmin } from "../helpers/auth";
  3  | import { uploadFixtureImage } from "../helpers/admin";
  4  | import { uniqueSuffix } from "../helpers/env";
  5  | 
  6  | test.describe("Admin banners", () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await loginAsAdmin(page);
  9  |   });
  10 | 
  11 |   test("create and edit banner", async ({ page }) => {
  12 |     const title = `E2E Good Gifts ${uniqueSuffix()}`;
  13 |     await page.goto("/admin/banners/new");
> 14 |     await page.getByLabel("Title").fill(title);
     |                                    ^ Error: locator.fill: Error: strict mode violation: getByLabel('Title') resolved to 2 elements:
  15 |     await page.getByLabel("Subtitle").fill("Good gifts for good relations");
  16 |     await page.getByLabel("Link URL").fill("/shop");
  17 |     await uploadFixtureImage(page);
  18 |     await page.getByRole("button", { name: "Create banner" }).click();
  19 |     await expect(page).toHaveURL(/\/admin\/banners/, { timeout: 45_000 });
  20 |     await expect(page.getByText(title)).toBeVisible();
  21 | 
  22 |     await page.getByRole("row", { name: new RegExp(title) }).getByRole("link", { name: "Edit" }).click();
  23 |     const updated = `${title} updated`;
  24 |     await page.getByLabel("Title").fill(updated);
  25 |     await page.getByRole("button", { name: "Save changes" }).click();
  26 |     await expect(page).toHaveURL(/\/admin\/banners/);
  27 |     await expect(page.getByText(updated)).toBeVisible();
  28 |   });
  29 | });
  30 | 
```