# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin/staff.spec.ts >> Admin staff >> create staff member
- Location: e2e/admin/staff.spec.ts:10:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('e2e-staff-1789367963726-ibxx7p@example.com').or(getByText('E2E Staff 1789367963726-ibxx7p'))
Expected: visible
Error: strict mode violation: getByText('e2e-staff-1789367963726-ibxx7p@example.com').or(getByText('E2E Staff 1789367963726-ibxx7p')) resolved to 2 elements:
    1) <td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-medium">E2E Staff 1789367963726-ibxx7p</td> aka getByRole('cell', { name: 'E2E Staff 1789367963726-ibxx7p' })
    2) <td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0">e2e-staff-1789367963726-ibxx7p@example.com</td> aka getByRole('cell', { name: 'e2e-staff-1789367963726-' })

Call log:
  - Expect "toBeVisible" getByText('e2e-staff-1789367963726-ibxx7p@example.com').or(getByText('E2E Staff 1789367963726-ibxx7p')) with timeout 20000ms
  - waiting for getByText('e2e-staff-1789367963726-ibxx7p@example.com').or(getByText('E2E Staff 1789367963726-ibxx7p'))

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
        - generic [ref=f1e79]:
          - heading "Staff" [level=1] [ref=f1e80]
          - link "Add Staff" [ref=f1e81] [cursor=pointer]:
            - /url: /admin/staff/new
        - generic [ref=f1e82]:
          - generic [ref=f1e83]:
            - generic [ref=f1e84]: Search
            - textbox "Search" [ref=f1e86]:
              - /placeholder: Name, email, phone…
          - generic [ref=f1e87]:
            - generic [ref=f1e88]: Status
            - combobox "Status" [ref=f1e89]:
              - option "All statuses" [selected]
              - option "Active"
              - option "Disabled"
          - button "Apply" [ref=f1e91]
        - table [ref=f1e93]:
          - rowgroup [ref=f1e94]:
            - row [ref=f1e95]:
              - columnheader "Name" [ref=f1e96]
              - columnheader "Email" [ref=f1e97]
              - columnheader "Permissions" [ref=f1e98]
              - columnheader "Status" [ref=f1e99]
              - columnheader "Actions" [ref=f1e100]
          - rowgroup [ref=f1e101]:
            - row [ref=f1e102]:
              - cell "E2E Staff 1789367963726-ibxx7p" [ref=f1e103]
              - cell "e2e-staff-1789367963726-ibxx7p@example.com" [ref=f1e104]
              - cell "1 permission" [ref=f1e105]
              - cell "Active" [ref=f1e107]
              - cell [ref=f1e109]:
                - link "Edit" [ref=f1e110] [cursor=pointer]:
                  - /url: /admin/staff/dcb630c3-6d54-4b53-864b-5f3e890b2265
                - button "Disable" [ref=f1e111]
                - button [ref=f1e112]
        - generic [ref=f1e113]:
          - paragraph [ref=f1e114]: Showing 1–1 of 1
          - generic [ref=f1e115]:
            - button "Prev" [disabled]
            - generic [ref=f1e116]: Page 1 of 1
            - button "Next" [disabled]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=f1e122] [cursor=pointer]
  - alert [ref=f1e126]: Staff
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsAdmin } from "../helpers/auth";
  3  | import { uniqueSuffix } from "../helpers/env";
  4  | 
  5  | test.describe("Admin staff", () => {
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await loginAsAdmin(page);
  8  |   });
  9  | 
  10 |   test("create staff member", async ({ page }) => {
  11 |     const suffix = uniqueSuffix();
  12 |     const email = `e2e-staff-${suffix}@example.com`;
  13 |     await page.goto("/admin/staff/new");
  14 |     await page.getByLabel("Full name").fill(`E2E Staff ${suffix}`);
  15 |     await page.getByLabel("Email").fill(email);
  16 |     await page.getByLabel("Temporary password").fill("StaffPass123!");
  17 |     await page.getByRole("button", { name: "Create staff" }).click();
  18 |     await expect(page).toHaveURL(/\/admin\/staff/, { timeout: 45_000 });
> 19 |     await expect(page.getByText(email).or(page.getByText(`E2E Staff ${suffix}`))).toBeVisible();
     |                                                                                   ^ Error: expect(locator).toBeVisible() failed
  20 |   });
  21 | });
  22 | 
```