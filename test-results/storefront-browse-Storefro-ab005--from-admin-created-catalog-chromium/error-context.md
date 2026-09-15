# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront/browse.spec.ts >> Storefront home & browse >> category and product pages from admin-created catalog
- Location: e2e/storefront/browse.spec.ts:29:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('E2E Baby Boy Wooden Basket 1789368023346-ps9cw9').or(getByText('E2E Gift Baskets 1789368017254-5nsvnr'))
Expected: visible
Error: strict mode violation: getByText('E2E Baby Boy Wooden Basket 1789368023346-ps9cw9').or(getByText('E2E Gift Baskets 1789368017254-5nsvnr')) resolved to 2 elements:
    1) <h1 class="text-3xl font-bold">E2E Gift Baskets 1789368017254-5nsvnr</h1> aka getByRole('heading', { name: 'E2E Gift Baskets' })
    2) <h3 class="mt-0.5 font-medium leading-snug text-kraft-ink transition group-hover:text-primary">E2E Baby Boy Wooden Basket 1789368023346-ps9cw9</h3> aka getByRole('link', { name: 'No image Sale E2E Baby Boy' })

Call log:
  - Expect "toBeVisible" getByText('E2E Baby Boy Wooden Basket 1789368023346-ps9cw9').or(getByText('E2E Gift Baskets 1789368017254-5nsvnr')) with timeout 20000ms
  - waiting for getByText('E2E Baby Boy Wooden Basket 1789368023346-ps9cw9').or(getByText('E2E Gift Baskets 1789368017254-5nsvnr'))

```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - banner [ref=f3e2]:
    - generic [ref=f3e3]:
      - link "Shopping Kraft" [ref=f3e4] [cursor=pointer]:
        - /url: /
      - generic [ref=f3e6]:
        - link "Search" [ref=f3e7] [cursor=pointer]:
          - /url: /search
        - link "Account" [ref=f3e11] [cursor=pointer]:
          - /url: /account
        - link "Cart" [ref=f3e15] [cursor=pointer]:
          - /url: /cart
        - link "Admin" [ref=f3e19] [cursor=pointer]:
          - /url: /admin
        - button "Open menu" [ref=f3e20]
  - main [ref=f3e22]:
    - generic [ref=f3e23]:
      - generic [ref=f3e24]:
        - heading "E2E Gift Baskets 1789368017254-5nsvnr" [level=1] [ref=f3e25]
        - paragraph [ref=f3e26]: E2E gift category for Shopping Kraft
      - link "No image Sale E2E Baby Boy Wooden Basket 1789368023346-ps9cw9 Rs 1,999 Rs 2,499" [ref=f3e28] [cursor=pointer]:
        - /url: /product/e2e-baby-boy-wooden-basket-1789368023346-ps9cw9
        - generic [ref=f3e29]:
          - generic [ref=f3e30]: No image
          - generic [ref=f3e31]: Sale
        - generic [ref=f3e32]:
          - heading "E2E Baby Boy Wooden Basket 1789368023346-ps9cw9" [level=3] [ref=f3e33]
          - generic [ref=f3e34]:
            - generic [ref=f3e35]: Rs 1,999
            - generic [ref=f3e36]: Rs 2,499
  - contentinfo [ref=f3e37]:
    - generic [ref=f3e39]:
      - generic [ref=f3e40]:
        - generic [ref=f3e41]:
          - paragraph [ref=f3e42]: Shopping Kraft
          - paragraph [ref=f3e43]: Good gifts for good relations — curated hampers and custom wooden baskets, delivered across Pakistan.
        - generic [ref=f3e44]:
          - heading "Explore" [level=4] [ref=f3e45]
          - list [ref=f3e46]:
            - listitem [ref=f3e47]:
              - link "Full catalog" [ref=f3e48] [cursor=pointer]:
                - /url: /shop
            - listitem [ref=f3e49]:
              - link "Search" [ref=f3e50] [cursor=pointer]:
                - /url: /search
            - listitem [ref=f3e51]:
              - link "Bag" [ref=f3e52] [cursor=pointer]:
                - /url: /cart
        - generic [ref=f3e53]:
          - heading "Account" [level=4] [ref=f3e54]
          - list [ref=f3e55]:
            - listitem [ref=f3e56]:
              - link "My account" [ref=f3e57] [cursor=pointer]:
                - /url: /account
            - listitem [ref=f3e58]:
              - link "Orders" [ref=f3e59] [cursor=pointer]:
                - /url: /account/orders
            - listitem [ref=f3e60]:
              - link "Sign in" [ref=f3e61] [cursor=pointer]:
                - /url: /login
        - generic [ref=f3e62]:
          - heading "Contact" [level=4] [ref=f3e63]
          - paragraph [ref=f3e64]: hello@shoppingkraft.com+92 313 5009138Shop F111, 1st floor, Rabi Saddar, Adamjee Road, Saddar Rawalpindi
          - list [ref=f3e65]:
            - listitem [ref=f3e66]:
              - link "Instagram" [ref=f3e67] [cursor=pointer]:
                - /url: https://www.instagram.com/shoppingkraft/
            - listitem [ref=f3e68]:
              - link "Facebook" [ref=f3e69] [cursor=pointer]:
                - /url: https://www.facebook.com/ShopKraft/
            - listitem [ref=f3e70]:
              - link "TikTok" [ref=f3e71] [cursor=pointer]:
                - /url: https://www.tiktok.com/@shoppingkraft
      - generic [ref=f3e72]:
        - paragraph [ref=f3e73]: © 2026 Shopping Kraft
        - paragraph [ref=f3e74]: Crafted for Pakistan · Fast nationwide delivery
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=f3e80] [cursor=pointer]
  - alert [ref=f3e84]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsAdmin } from "../helpers/auth";
  3  | import {
  4  |   createCategoryViaAdmin,
  5  |   createProductViaAdmin,
  6  | } from "../helpers/admin";
  7  | 
  8  | test.describe("Storefront home & browse", () => {
  9  |   test("homepage shows brand and why section", async ({ page }) => {
  10 |     await page.goto("/");
  11 |     await expect(page.getByText("Shopping Kraft").first()).toBeVisible();
  12 |     await expect(
  13 |       page.getByRole("heading", { name: /Good gifts for good relations/i }),
  14 |     ).toBeVisible();
  15 |     await expect(page.getByText("+92 313 5009138")).toBeVisible();
  16 |     await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();
  17 |   });
  18 | 
  19 |   test("shop page loads", async ({ page }) => {
  20 |     await page.goto("/shop");
  21 |     await expect(page.getByRole("heading", { name: /Shop|Catalog|Products/i }).or(page.locator("h1")).first()).toBeVisible();
  22 |   });
  23 | 
  24 |   test("search page loads", async ({ page }) => {
  25 |     await page.goto("/search");
  26 |     await expect(page.locator("h1, form").first()).toBeVisible();
  27 |   });
  28 | 
  29 |   test("category and product pages from admin-created catalog", async ({
  30 |     page,
  31 |   }) => {
  32 |     await loginAsAdmin(page);
  33 |     const { name: categoryName, slug: categorySlug } =
  34 |       await createCategoryViaAdmin(page);
  35 |     const { name: productName, slug: productSlug } =
  36 |       await createProductViaAdmin(page, categoryName);
  37 | 
  38 |     await page.goto(`/category/${categorySlug}`);
> 39 |     await expect(page.getByText(productName).or(page.getByText(categoryName))).toBeVisible();
     |                                                                                ^ Error: expect(locator).toBeVisible() failed
  40 | 
  41 |     await page.goto(`/product/${productSlug}`);
  42 |     await expect(page.getByRole("heading", { name: productName })).toBeVisible();
  43 |     await expect(page.getByText(/PKR|Rs|2,?499|1,?999/i).first()).toBeVisible();
  44 |   });
  45 | });
  46 | 
```