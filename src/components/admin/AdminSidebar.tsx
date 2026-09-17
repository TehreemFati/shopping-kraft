"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Warehouse,
  Ticket,
  Settings,
  LogOut,
  Store,
  UserCog,
  Star,
  Image as ImageIcon,
  Percent,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import type { Permission } from "@/lib/auth/permissions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: Permission;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "products.view" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, permission: "categories.view" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: "orders.view" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers.view" },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse, permission: "inventory.view" },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, permission: "coupons.view" },
  { href: "/admin/sales", label: "Sales", icon: Percent, permission: "sales.view" },
  { href: "/admin/reviews", label: "Reviews", icon: Star, permission: "reviews.view" },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon, permission: "banners.view" },
  { href: "/admin/staff", label: "Staff", icon: UserCog, permission: "staff.manage" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
];

function AdminNav({
  permissions,
  onNavigate,
}: {
  permissions: Permission[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const allowed = navItems.filter((item) =>
    permissions.includes(item.permission),
  );

  return (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {allowed.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-kraft-ink text-kraft-citrus shadow-sm"
                  : "text-kraft-ink/65 hover:bg-kraft-mist hover:text-kraft-ink",
              )}
            >
              {active ? (
                <span
                  className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-kraft-citrus"
                  aria-hidden
                />
              ) : null}
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-kraft-ink/10 p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-kraft-ink/15"
          asChild
        >
          <Link href="/" onClick={onNavigate}>
            <Store className="mr-2 h-4 w-4" />
            View Store
          </Link>
        </Button>
        <form action={logout}>
          <Button variant="ghost" size="sm" className="w-full" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </>
  );
}

export function AdminSidebar({
  permissions,
}: {
  permissions: Permission[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-kraft-ink/10 bg-background px-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label="Open admin menu"
                className="flex size-10 items-center justify-center rounded-md hover:bg-muted"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(100%,18rem)] gap-0 p-0"
            showCloseButton
          >
            <SheetHeader className="border-b border-kraft-ink/10 px-4 py-4 text-left">
              <SheetTitle className="font-display text-lg text-kraft-ink">
                Shopping Kraft
              </SheetTitle>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Admin
              </p>
            </SheetHeader>
            <div className="flex h-full flex-col">
              <AdminNav
                permissions={permissions}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="font-display text-base text-kraft-ink">
          Shopping Kraft
          <span className="ml-1.5 text-xs font-sans font-medium tracking-wide text-muted-foreground uppercase">
            Admin
          </span>
        </Link>
      </div>

      <aside className="relative hidden h-full w-64 shrink-0 flex-col border-r border-kraft-ink/10 bg-kraft-mist/60 md:flex">
        <div className="pointer-events-none absolute inset-0 kraft-grain opacity-25" />
        <div className="relative flex h-16 shrink-0 items-center border-b border-kraft-ink/10 px-5">
          <Link href="/admin" className="min-w-0">
            <span className="font-display text-lg tracking-tight text-kraft-ink">
              Shopping Kraft
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.18em] text-kraft-ink/45 uppercase">
              Admin atelier
            </span>
          </Link>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <AdminNav permissions={permissions} />
        </div>
      </aside>
    </>
  );
}
