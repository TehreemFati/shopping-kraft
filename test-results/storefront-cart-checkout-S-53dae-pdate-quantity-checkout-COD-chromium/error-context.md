# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront/cart-checkout.spec.ts >> Storefront cart & checkout >> add to cart, update quantity, checkout COD
- Location: e2e/storefront/cart-checkout.spec.ts:10:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Add to Cart' })

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
          - /url: /login
        - link "Cart" [ref=f3e15] [cursor=pointer]:
          - /url: /cart
        - button "Open menu" [ref=f3e19]
  - main [ref=f3e21]:
    - generic [ref=f3e23]:
      - generic [ref=f3e24]: No image
      - generic [ref=f3e27]:
        - paragraph [ref=f3e28]: E2E Gift Baskets 1789368038580-uaay72
        - heading "E2E Baby Boy Wooden Basket 1789368044875-atq7ju" [level=1] [ref=f3e29]
        - generic [ref=f3e30]:
          - generic [ref=f3e31]: Rs 1,999
          - generic [ref=f3e32]: Rs 2,499
          - generic [ref=f3e33]: Sale
        - paragraph [ref=f3e34]: "SKU: E2E-1789368044875-atq7ju"
        - paragraph [ref=f3e35]: Out of stock
        - generic [ref=f3e36]:
          - button "Out of Stock" [disabled]
        - generic [ref=f3e37]:
          - heading "Description" [level=2] [ref=f3e38]
          - paragraph [ref=f3e39]: Customisable baby boy wooden gift basket. Delivery across Pakistan.
  - contentinfo [ref=f3e40]:
    - generic [ref=f3e42]:
      - generic [ref=f3e43]:
        - generic [ref=f3e44]:
          - paragraph [ref=f3e45]: Shopping Kraft
          - paragraph [ref=f3e46]: Good gifts for good relations — curated hampers and custom wooden baskets, delivered across Pakistan.
        - generic [ref=f3e47]:
          - heading "Explore" [level=4] [ref=f3e48]
          - list [ref=f3e49]:
            - listitem [ref=f3e50]:
              - link "Full catalog" [ref=f3e51] [cursor=pointer]:
                - /url: /shop
            - listitem [ref=f3e52]:
              - link "Search" [ref=f3e53] [cursor=pointer]:
                - /url: /search
            - listitem [ref=f3e54]:
              - link "Bag" [ref=f3e55] [cursor=pointer]:
                - /url: /cart
        - generic [ref=f3e56]:
          - heading "Account" [level=4] [ref=f3e57]
          - list [ref=f3e58]:
            - listitem [ref=f3e59]:
              - link "My account" [ref=f3e60] [cursor=pointer]:
                - /url: /account
            - listitem [ref=f3e61]:
              - link "Orders" [ref=f3e62] [cursor=pointer]:
                - /url: /account/orders
            - listitem [ref=f3e63]:
              - link "Sign in" [ref=f3e64] [cursor=pointer]:
                - /url: /login
        - generic [ref=f3e65]:
          - heading "Contact" [level=4] [ref=f3e66]
          - paragraph [ref=f3e67]: hello@shoppingkraft.com+92 313 5009138Shop F111, 1st floor, Rabi Saddar, Adamjee Road, Saddar Rawalpindi
          - list [ref=f3e68]:
            - listitem [ref=f3e69]:
              - link "Instagram" [ref=f3e70] [cursor=pointer]:
                - /url: https://www.instagram.com/shoppingkraft/
            - listitem [ref=f3e71]:
              - link "Facebook" [ref=f3e72] [cursor=pointer]:
                - /url: https://www.facebook.com/ShopKraft/
            - listitem [ref=f3e73]:
              - link "TikTok" [ref=f3e74] [cursor=pointer]:
                - /url: https://www.tiktok.com/@shoppingkraft
      - generic [ref=f3e75]:
        - paragraph [ref=f3e76]: © 2026 Shopping Kraft
        - paragraph [ref=f3e77]: Crafted for Pakistan · Fast nationwide delivery
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=f3e83] [cursor=pointer]
  - alert [ref=f3e87]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsAdmin } from "../helpers/auth";
  3  | import {
  4  |   createCategoryViaAdmin,
  5  |   createProductViaAdmin,
  6  |   expectToast,
  7  | } from "../helpers/admin";
  8  | 
  9  | test.describe("Storefront cart & checkout", () => {
  10 |   test("add to cart, update quantity, checkout COD", async ({ page }) => {
  11 |     await loginAsAdmin(page);
  12 |     const { name: categoryName } = await createCategoryViaAdmin(page);
  13 |     const { name: productName, slug } = await createProductViaAdmin(
  14 |       page,
  15 |       categoryName,
  16 |     );
  17 | 
  18 |     // Guest session for cart
  19 |     await page.context().clearCookies();
  20 |     await page.goto(`/product/${slug}`);
> 21 |     await page.getByRole("button", { name: "Add to Cart" }).click();
     |                                                             ^ Error: locator.click: Test timeout of 90000ms exceeded.
  22 |     await expectToast(page, /Added to cart/i);
  23 | 
  24 |     await page.goto("/cart");
  25 |     await expect(page.getByText(productName)).toBeVisible();
  26 | 
  27 |     const plus = page.getByRole("button", { name: /Increase|Plus/i }).or(
  28 |       page.locator("button").filter({ has: page.locator("svg.lucide-plus") }),
  29 |     );
  30 |     if (await plus.first().isVisible()) {
  31 |       await plus.first().click();
  32 |     }
  33 | 
  34 |     await page.goto("/checkout");
  35 |     await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  36 |     await page.getByLabel("Full Name").fill("E2E Buyer");
  37 |     await page.getByLabel("Phone").fill("03135009138");
  38 |     await page.getByLabel("Address", { exact: true }).fill("Shop F111 Saddar");
  39 |     await page.getByLabel("City").fill("Rawalpindi");
  40 |     await page.getByLabel("Province").fill("Punjab");
  41 |     await page.getByText("Cash on Delivery (COD)").click();
  42 |     await page.getByRole("button", { name: "Place Order" }).click();
  43 |     await expect(
  44 |       page.getByText(/Order placed successfully|Your cart is empty|Sign In/i).first(),
  45 |     ).toBeVisible({ timeout: 45_000 });
  46 |   });
  47 | 
  48 |   test("remove item from cart", async ({ page }) => {
  49 |     await loginAsAdmin(page);
  50 |     const { name: categoryName } = await createCategoryViaAdmin(page);
  51 |     const { name: productName, slug } = await createProductViaAdmin(
  52 |       page,
  53 |       categoryName,
  54 |     );
  55 | 
  56 |     await page.context().clearCookies();
  57 |     await page.goto(`/product/${slug}`);
  58 |     await page.getByRole("button", { name: "Add to Cart" }).click();
  59 |     await expectToast(page, /Added to cart/i);
  60 | 
  61 |     await page.goto("/cart");
  62 |     await expect(page.getByText(productName)).toBeVisible();
  63 |     await page
  64 |       .getByRole("button", { name: /Remove|Delete/i })
  65 |       .or(page.locator("button").filter({ has: page.locator("svg.lucide-trash-2") }))
  66 |       .first()
  67 |       .click();
  68 |     await expect(page.getByText(/Your cart is empty/i)).toBeVisible({
  69 |       timeout: 20_000,
  70 |     });
  71 |   });
  72 | });
  73 | 
```