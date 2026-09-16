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
      <div className="mx-auto flex h-16 max-w-6xl min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <div className="min-w-0 shrink">
          <BrandLogo size="sm" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-10 items-center justify-center text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <Search className="size-5" />
          </Link>

          {currentUser && role ? (
            <UserMenu
              fullName={currentUser.profile?.full_name ?? null}
              email={currentUser.user.email}
              role={role}
            />
          ) : (
            <GuestAccountLink />
          )}

          {showCart ? (
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
    </header>
  );
}
