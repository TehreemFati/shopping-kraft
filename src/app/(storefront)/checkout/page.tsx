import { redirect } from "next/navigation";
import { getCartItems } from "@/lib/actions/cart";
import { getAllSettings, getCurrentUser } from "@/lib/queries/storefront";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";
import { StorePageShell } from "@/components/storefront/StorePageShell";

export const metadata = { title: "Checkout" };

type WalletAccount = {
  account_title: string;
  account_number: string;
};

type BankAccount = {
  bank: string;
  account_title: string;
  account_number: string;
  iban: string;
};

export default async function CheckoutPage() {
  const currentUser = await getCurrentUser();
  if (isAdminOrStaff(currentUser?.profile?.role)) {
    redirect("/admin");
  }

  const [items, settings] = await Promise.all([
    getCartItems(),
    getAllSettings(),
  ]);

  const shipping = Number(settings.shipping_flat_rate ?? 200);
  const bankAccount = settings.bank_account as BankAccount | undefined;
  const contactPhone = String(settings.contact_phone ?? "03135009138");

  const jazzcashAccount = (settings.jazzcash_account as WalletAccount | undefined) ?? {
    account_title: "Shopping Kraft",
    account_number: contactPhone,
  };

  const easypaisaAccount = (settings.easypaisa_account as WalletAccount | undefined) ?? {
    account_title: "Shopping Kraft",
    account_number: contactPhone,
  };

  return (
    <StorePageShell>
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <h1 className="mb-8 font-display text-3xl text-kraft-ink">Checkout</h1>
      <CheckoutForm
        items={items}
        shipping={shipping}
        bankAccount={bankAccount}
        jazzcashAccount={jazzcashAccount}
        easypaisaAccount={easypaisaAccount}
      />
    </StorePageShell>
  );
}
