# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin/products.spec.ts >> Admin products >> list, create, and edit product
- Location: e2e/admin/products.spec.ts:14:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('row', { name: /E2E Baby Boy Wooden Basket 1789367835318-mv4lsa/ }).getByRole('link', { name: 'Edit' })

```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - generic [ref=f3e2]:
    - complementary [ref=f3e3]:
      - link "Admin Panel" [ref=f3e5] [cursor=pointer]:
        - /url: /admin
      - navigation [ref=f3e6]:
        - link "Dashboard" [ref=f3e7] [cursor=pointer]:
          - /url: /admin
        - link "Products" [ref=f3e13] [cursor=pointer]:
          - /url: /admin/products
        - link "Categories" [ref=f3e18] [cursor=pointer]:
          - /url: /admin/categories
        - link "Orders" [ref=f3e24] [cursor=pointer]:
          - /url: /admin/orders
        - link "Customers" [ref=f3e30] [cursor=pointer]:
          - /url: /admin/customers
        - link "Inventory" [ref=f3e36] [cursor=pointer]:
          - /url: /admin/inventory
        - link "Coupons" [ref=f3e40] [cursor=pointer]:
          - /url: /admin/coupons
        - link "Sales" [ref=f3e43] [cursor=pointer]:
          - /url: /admin/sales
        - link "Reviews" [ref=f3e48] [cursor=pointer]:
          - /url: /admin/reviews
        - link "Banners" [ref=f3e51] [cursor=pointer]:
          - /url: /admin/banners
        - link "Staff" [ref=f3e56] [cursor=pointer]:
          - /url: /admin/staff
        - link "Settings" [ref=f3e69] [cursor=pointer]:
          - /url: /admin/settings
      - generic [ref=f3e73]:
        - link "View Store" [ref=f3e74] [cursor=pointer]:
          - /url: /
        - button "Logout" [ref=f3e76]
    - main [ref=f3e77]:
      - generic [ref=f3e78]:
        - generic [ref=f3e79]:
          - heading "Products" [level=1] [ref=f3e80]
          - link "Add Product" [ref=f3e81] [cursor=pointer]:
            - /url: /admin/products/new
        - generic [ref=f3e82]:
          - generic [ref=f3e83]:
            - generic [ref=f3e84]: Search
            - textbox "Search" [ref=f3e86]:
              - /placeholder: Name, SKU, slug…
          - generic [ref=f3e87]:
            - generic [ref=f3e88]: Status
            - combobox "Status" [ref=f3e89]:
              - option "All statuses" [selected]
              - option "Active"
              - option "Inactive"
          - generic [ref=f3e90]:
            - generic [ref=f3e91]: Featured
            - combobox "Featured" [ref=f3e92]:
              - option "All" [selected]
              - option "Featured"
              - option "Not featured"
          - button "Apply" [ref=f3e94]
        - table [ref=f3e96]:
          - rowgroup [ref=f3e97]:
            - row [ref=f3e98]:
              - columnheader "Name" [ref=f3e99]
              - columnheader "Category" [ref=f3e100]
              - columnheader "Price" [ref=f3e101]
              - columnheader "Stock" [ref=f3e102]
              - columnheader "Status" [ref=f3e103]
              - columnheader "Actions" [ref=f3e104]
          - rowgroup [ref=f3e105]:
            - row [ref=f3e106]:
              - cell "E2E Baby Boy Wooden Basket 1789367835318-mv4lsa" [ref=f3e107]
              - cell "E2E Gift Baskets 1789367829148-ijh2cw" [ref=f3e108]
              - cell "Rs 2,499" [ref=f3e109]
              - cell "25" [ref=f3e110]
              - cell "Active" [ref=f3e111]
              - cell [ref=f3e113]:
                - link [ref=f3e114] [cursor=pointer]:
                  - /url: /admin/products/a4a216c0-45ce-4230-af27-e2accfed4958/edit
                - button [ref=f3e115]
            - row [ref=f3e116]:
              - cell "E2E Baby Boy Wooden Basket 1789367777316-827l9u" [ref=f3e117]
              - cell "E2E Gift Baskets 1789367771216-2awhm1" [ref=f3e118]
              - cell "Rs 2,499" [ref=f3e119]
              - cell "40" [ref=f3e120]
              - cell "Active" [ref=f3e121]
              - cell [ref=f3e123]:
                - link [ref=f3e124] [cursor=pointer]:
                  - /url: /admin/products/24cdef80-6345-43cd-bf6b-00dcb07757a7/edit
                - button [ref=f3e125]
        - generic [ref=f3e126]:
          - paragraph [ref=f3e127]: Showing 1–2 of 2
          - generic [ref=f3e128]:
            - button "Prev" [disabled]
            - generic [ref=f3e129]: Page 1 of 1
            - button "Next" [disabled]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=f3e135] [cursor=pointer]
  - alert [ref=f3e139]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsAdmin } from "../helpers/auth";
  3  | import {
  4  |   createCategoryViaAdmin,
  5  |   createProductViaAdmin,
  6  | } from "../helpers/admin";
  7  | import { uniqueSuffix } from "../helpers/env";
  8  | 
  9  | test.describe("Admin products", () => {
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await loginAsAdmin(page);
  12 |   });
  13 | 
  14 |   test("list, create, and edit product", async ({ page }) => {
  15 |     const { name: categoryName } = await createCategoryViaAdmin(page);
  16 |     const { name } = await createProductViaAdmin(page, categoryName);
  17 | 
  18 |     await page.goto("/admin/products");
  19 |     await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  20 |     await expect(page.getByText(name)).toBeVisible();
  21 | 
> 22 |     await page.getByRole("row", { name: new RegExp(name) }).getByRole("link", { name: "Edit" }).click();
     |                                                                                                 ^ Error: locator.click: Test timeout of 90000ms exceeded.
  23 |     await expect(page.getByRole("heading", { name: "Edit Product" })).toBeVisible();
  24 | 
  25 |     const updated = `${name} edit ${uniqueSuffix().slice(0, 4)}`;
  26 |     await page.getByLabel("Product Name").fill(updated);
  27 |     await page.getByLabel("Price (PKR)").fill("2799");
  28 |     await page.getByRole("button", { name: "Save Product" }).click();
  29 |     await expect(page).toHaveURL(/\/admin\/products/);
  30 |     await expect(page.getByText(updated)).toBeVisible();
  31 |   });
  32 | });
  33 | 
```