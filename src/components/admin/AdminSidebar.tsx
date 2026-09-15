"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import type { Permission } from "@/lib/auth/permissions";

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

export function AdminSidebar({
  permissions,
}: {
  permissions: Permission[];
}) {
  const pathname = usePathname();
  const allowed = navItems.filter((item) => permissions.includes(item.permission));

  return (
    <aside className="flex w-64 flex-col border-r bg-muted/20">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="text-lg font-bold">
          Admin Panel
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {allowed.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 border-t p-4">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/">
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
    </aside>
  );
}
