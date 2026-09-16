import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import {
  getNavCategories,
  getCurrentUser,
  getActiveSaleCampaigns,
} from "@/lib/queries/storefront";
import { getCartCount } from "@/lib/actions/cart";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { StoreNav } from "@/components/storefront/StoreNav";
import { StorePrimaryNav } from "@/components/storefront/StorePrimaryNav";
import { BrandLogo } from "@/components/storefront/BrandLogo";
import {
  GuestAccountLink,
  UserMenu,
} from "@/components/storefront/UserMenu";

export async function Header() {
  const [categories, cartCount, currentUser, campaigns] = await Promise.all([
    getNavCategories(12),
    getCartCount(),
    getCurrentUser(),
    getActiveSaleCampaigns(),
  ]);

  const role = currentUser?.profile?.role ?? null;
  const staffUser = isAdminOrStaff(role);
  const showCart = !staffUser;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-kraft-ink text-white">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <div className="min-w-0 shrink">
          <BrandLogo size="sm" tone="onDark" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-10 items-center justify-center text-kraft-citrus/90 transition hover:bg-white/10 hover:text-kraft-citrus"
          >
            <Search className="size-5" />
          </Link>

          {currentUser && role ? (
            <UserMenu
              fullName={currentUser.profile?.full_name ?? null}
              email={currentUser.user.email}
              role={role}
              tone="onDark"
            />
          ) : (
            <GuestAccountLink tone="onDark" />
          )}

          {showCart ? (
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex size-10 items-center justify-center text-kraft-citrus/90 transition hover:bg-white/10 hover:text-kraft-citrus"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center bg-kraft-citrus text-[10px] font-bold text-kraft-ink">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          <StoreNav
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              children: c.children,
            }))}
            campaigns={campaigns.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              sale_type: c.sale_type,
            }))}
            user={
              currentUser && role
                ? {
                    fullName: currentUser.profile?.full_name ?? null,
                    email: currentUser.user.email ?? null,
                    role,
                  }
                : null
            }
          />
        </div>
      </div>

      <div className="hidden border-t border-white/10 md:block">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-center px-6">
          <StorePrimaryNav tone="onDark" />
        </div>
      </div>
    </header>
  );
}
