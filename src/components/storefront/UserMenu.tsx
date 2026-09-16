"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserMenuProps = {
  fullName: string | null;
  email?: string | null;
  role: "customer" | "admin" | "staff";
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

export function UserMenu({ fullName, email, role }: UserMenuProps) {
  const isStaff = role === "admin" || role === "staff";
  const name = displayName(fullName, email);
  const letter = initial(fullName, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex max-w-[9.5rem] items-center gap-2 rounded-md px-2 py-1.5 text-white/90 transition hover:bg-white/10 hover:text-white"
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
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{fullName?.trim() || name}</p>
          {email ? (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isStaff ? (
          <DropdownMenuItem render={<Link href="/admin" />}>
            Admin Dashboard
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem render={<Link href="/account" />}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/orders" />}>
              Orders
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/addresses" />}>
              Addresses
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void logout();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GuestAccountLink() {
  return (
    <Link
      href="/login"
      aria-label="Login"
      className="flex size-10 items-center justify-center text-white/85 transition hover:bg-white/10 hover:text-white"
    >
      <User className="size-5" />
    </Link>
  );
}
