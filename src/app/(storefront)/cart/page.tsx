import { redirect } from "next/navigation";
import { getCartItems } from "@/lib/actions/cart";
import { getCurrentUser } from "@/lib/queries/storefront";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { CartItems } from "@/components/storefront/CartItems";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const currentUser = await getCurrentUser();
  if (isAdminOrStaff(currentUser?.profile?.role)) {
    redirect("/admin");
  }

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
