import { getCartItems } from "@/lib/actions/cart";
import { CartItems } from "@/components/storefront/CartItems";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const items = await getCartItems();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart" },
        ]}
      />
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <CartItems items={items} />
    </div>
  );
}
