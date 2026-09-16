"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  OCCASION_LINKS,
  RECIPIENT_LINKS,
} from "@/lib/storefront/home-links";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const linkBase =
  "inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] uppercase transition";

export function StorePrimaryNav({
  className,
  tone = "onDark",
}: {
  className?: string;
  tone?: "onDark" | "onLight";
}) {
  const onDark = tone === "onDark";
  const itemClass = onDark
    ? "text-white/80 outline-none hover:text-kraft-citrus data-popup-open:text-kraft-citrus"
    : "text-kraft-ink/80 outline-none hover:text-kraft-ink data-popup-open:text-kraft-ink";
  const plainClass = onDark
    ? "text-white/80 hover:text-kraft-citrus"
    : "text-kraft-ink/80 hover:text-kraft-ink";

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "hidden items-center justify-center gap-6 lg:gap-8 md:flex",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(linkBase, itemClass)}>
          Occasions
          <ChevronDown className="size-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          {OCCASION_LINKS.map((item) => (
            <DropdownMenuItem
              key={item.label}
              className="p-0 focus:bg-transparent"
            >
              <Link
                href={item.href}
                className="block w-full px-2 py-1.5 text-sm hover:bg-accent"
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className={cn(linkBase, itemClass)}>
          Gifts For
          <ChevronDown className="size-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          {RECIPIENT_LINKS.map((item) => (
            <DropdownMenuItem
              key={item.label}
              className="p-0 focus:bg-transparent"
            >
              <Link
                href={item.href}
                className="block w-full px-2 py-1.5 text-sm hover:bg-accent"
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/shop?sort=newest" className={cn(linkBase, plainClass)}>
        New Arrivals
      </Link>
      <Link href="/shop?featured=1" className={cn(linkBase, plainClass)}>
        Best Sellers
      </Link>
      <Link
        href="/shop?on_sale=1"
        className={cn(
          linkBase,
          onDark
            ? "font-semibold text-kraft-citrus hover:text-white"
            : "font-semibold text-red-600 hover:text-red-700",
        )}
      >
        Sale
      </Link>
    </nav>
  );
}
