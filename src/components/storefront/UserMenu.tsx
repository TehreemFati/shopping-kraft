"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserMenuProps = {
  fullName: string | null;
  email?: string | null;
  role: "customer" | "admin" | "staff";
  tone?: "onDark" | "onLight";
};

function displayName(fullName: string | null, email?: string | null) {
  const name = fullName?.trim();
  if (name) return name.split(" ")[0];
  if (email) return email.split("@")[0];
  return "Account";
}

function initial(fullName: string | null, email?: string | null) {
  const name = fullName?.trim() || email || "?";
  return name.charAt(0).toUpperCase();
}

const itemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground";

export function UserMenu({
  fullName,
  email,
  role,
  tone = "onDark",
}: UserMenuProps) {
  const isStaff = role === "admin" || role === "staff";
  const name = displayName(fullName, email);
  const letter = initial(fullName, email);
  const onLight = tone === "onLight";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          onLight
            ? "flex max-w-[9.5rem] items-center gap-2 rounded-md px-2 py-1.5 text-kraft-ink/80 transition hover:bg-kraft-mist hover:text-kraft-ink"
            : "flex max-w-[9.5rem] items-center gap-2 rounded-md px-2 py-1.5 text-kraft-citrus/95 transition hover:bg-white/10 hover:text-kraft-citrus"
        }
        aria-label="Account menu"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-kraft-citrus text-xs font-bold text-kraft-ink">
          {letter}
        </span>
        <span className="hidden truncate text-sm font-medium sm:inline">
          {name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <div className="px-1.5 py-1.5">
          <p className="truncate text-sm font-medium">
            {fullName?.trim() || name}
          </p>
          {email ? (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {isStaff ? (
          <DropdownMenuItem className="p-0 focus:bg-transparent">
            <Link href="/admin" className={itemClass}>
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem className="p-0 focus:bg-transparent">
              <Link href="/account" className={itemClass}>
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 focus:bg-transparent">
              <Link href="/account/orders" className={itemClass}>
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 focus:bg-transparent">
              <Link href="/account/addresses" className={itemClass}>
                Addresses
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="p-0 focus:bg-transparent"
        >
          <button
            type="button"
            className={`${itemClass} text-destructive`}
            onClick={() => {
              void logout();
            }}
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GuestAccountLink({
  tone = "onDark",
}: {
  tone?: "onDark" | "onLight";
}) {
  const onLight = tone === "onLight";
  return (
    <Link
      href="/login"
      aria-label="Login"
      className={
        onLight
          ? "flex size-10 items-center justify-center text-kraft-ink/70 transition hover:bg-kraft-mist hover:text-kraft-ink"
          : "flex size-10 items-center justify-center text-kraft-citrus/90 transition hover:bg-white/10 hover:text-kraft-citrus"
      }
    >
      <User className="size-5" />
    </Link>
  );
}
