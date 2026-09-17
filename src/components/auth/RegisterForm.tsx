"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { register } from "@/lib/actions/auth";
import { toast } from "sonner";
import {
  StoreFormField,
  storeInputClassName,
} from "@/components/storefront/store-form";

const inputClass = `${storeInputClassName} bg-white shadow-[inset_0_1px_0_oklch(1_0_0/0.8)]`;

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        const errors = Object.values(result.error).flat();
        toast.error(errors[0] ?? "Registration failed");
      }
    });
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-kraft-ink/45 uppercase">
        Create account
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-tight text-kraft-ink">
        Let&apos;s get started
      </h2>
      <p className="mt-2 text-sm text-kraft-ink/60">
        Save addresses, track orders, and checkout in a few taps.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <StoreFormField label="Full name" htmlFor="full_name">
          <Input
            id="full_name"
            name="full_name"
            required
            placeholder="Your full name"
            className={inputClass}
          />
        </StoreFormField>
        <StoreFormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </StoreFormField>
        <StoreFormField label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className={inputClass}
          />
        </StoreFormField>
        <StoreFormField label="Confirm password" htmlFor="confirm_password">
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            className={inputClass}
          />
        </StoreFormField>
        <Button
          type="submit"
          className="mt-1 h-12 w-full rounded-xl bg-kraft-ink text-base font-semibold text-kraft-citrus transition hover:bg-kraft-ink/90 hover:brightness-105"
          disabled={isPending}
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-kraft-ink/55">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-kraft-ink underline decoration-kraft-citrus/80 underline-offset-4 transition hover:decoration-kraft-citrus"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
