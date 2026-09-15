import Link from "next/link";
import { Search, User, ShoppingBag } from "lucide-react";
import {
  getNavCategories,
  getCurrentUser,
  getActiveSaleCampaigns,
} from "@/lib/queries/storefront";
import { getCartCount } from "@/lib/actions/cart";
import { StoreNav } from "@/components/storefront/StoreNav";

export async function Header() {
  const [categories, cartCount, currentUser, campaigns] = await Promise.all([
    getNavCategories(12),
    getCartCount(),
    getCurrentUser(),
    getActiveSaleCampaigns(),
  ]);

  const isAdmin =
    currentUser?.profile?.role === "admin" ||
    currentUser?.profile?.role === "staff";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-kraft-ink text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <span className="font-display text-xl tracking-tight text-white sm:text-2xl">
            Shopping{" "}
            <span className="text-kraft-citrus">Kraft</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-0.5">
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-10 items-center justify-center text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <Search className="size-5" />
          </Link>
          <Link
            href={currentUser ? "/account" : "/login"}
            aria-label="Account"
            className="flex size-10 items-center justify-center text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex size-10 items-center justify-center text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center bg-kraft-citrus text-[10px] font-bold text-kraft-ink">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              className="ml-1 hidden border border-white/40 px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase transition hover:bg-white/10 sm:inline-flex"
            >
              Admin
            </Link>
          ) : null}
          <StoreNav
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            }))}
            campaigns={campaigns.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              sale_type: c.sale_type,
            }))}
          />
        </div>
      </div>
    </header>
  );
}
