"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import {
  OCCASION_LINKS,
  RECIPIENT_LINKS,
} from "@/lib/storefront/home-links";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type NavCampaign = {
  id: string;
  name: string;
  slug: string;
  sale_type: string;
};

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
};

export type StoreNavUser = {
  fullName: string | null;
  email: string | null;
  role: "customer" | "admin" | "staff";
} | null;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 mb-1 px-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase first:mt-0">
      {children}
    </p>
  );
}

export function StoreNav({
  categories,
  campaigns,
  user = null,
}: {
  categories: NavCategory[];
  campaigns: NavCampaign[];
  user?: StoreNavUser;
}) {
  const [open, setOpen] = useState(false);
  const isStaff = user?.role === "admin" || user?.role === "staff";

  function NavLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={
          className ??
          "block rounded-md px-3 py-2 text-sm font-medium text-kraft-ink transition hover:bg-muted"
        }
      >
        {children}
      </Link>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-10 shrink-0 items-center justify-center text-kraft-citrus/90 transition hover:bg-white/10 hover:text-kraft-citrus md:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100%,20rem)] gap-0 p-0">
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle className="font-display text-xl text-kraft-ink">
            Menu
          </SheetTitle>
          {user ? (
            <p className="truncate text-sm text-muted-foreground">
              {user.fullName?.trim() || user.email || "Account"}
            </p>
          ) : null}
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <SectionLabel>Shop</SectionLabel>
          <NavLink href="/shop?sort=newest">New Arrivals</NavLink>
          <NavLink href="/shop?featured=1">Best Sellers</NavLink>
          <NavLink
            href="/shop?on_sale=1"
            className="block rounded-md px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-muted"
          >
            Sale
          </NavLink>

          <SectionLabel>Occasions</SectionLabel>
          {OCCASION_LINKS.map((item) => (
            <NavLink key={item.label} href={item.href}>
              {item.label}
            </NavLink>
          ))}

          <SectionLabel>Gifts For</SectionLabel>
          {RECIPIENT_LINKS.map((item) => (
            <NavLink key={item.label} href={item.href}>
              {item.label}
            </NavLink>
          ))}

          <SectionLabel>Account</SectionLabel>
          {!user ? (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/register">Register</NavLink>
            </>
          ) : isStaff ? (
            <>
              <NavLink href="/admin">Admin Dashboard</NavLink>
              <button
                type="button"
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-kraft-ink transition hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/account">Profile</NavLink>
              <NavLink href="/account/orders">Orders</NavLink>
              <NavLink href="/account/addresses">Addresses</NavLink>
              <button
                type="button"
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-kraft-ink transition hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
              >
                Logout
              </button>
            </>
          )}

          {campaigns.length > 0 ? (
            <>
              <SectionLabel>Campaigns</SectionLabel>
              {campaigns.map((c) => (
                <NavLink key={c.id} href={`/sale/${c.slug}`}>
                  {c.name}
                </NavLink>
              ))}
            </>
          ) : null}

          {categories.length > 0 ? (
            <>
              <SectionLabel>Categories</SectionLabel>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <NavLink href={`/category/${cat.slug}`}>{cat.name}</NavLink>
                  {cat.children && cat.children.length > 0 ? (
                    <div className="mb-1 ml-3 border-l border-border pl-2">
                      {cat.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-kraft-ink"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </>
          ) : null}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
