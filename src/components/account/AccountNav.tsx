"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:flex-col md:space-y-1 md:overflow-visible md:pb-0">
      {nav.map((item) => {
        const active =
          item.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition",
              active
                ? "bg-kraft-ink text-kraft-citrus"
                : "text-kraft-ink/75 hover:bg-kraft-mist hover:text-kraft-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
