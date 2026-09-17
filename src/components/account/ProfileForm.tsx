"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { updatePassword, updateProfile } from "@/lib/actions/auth";
import { toast } from "sonner";
import type { Profile } from "@/types/database";
import {
  StoreFormField,
  StoreSectionCard,
  storeInputClassName,
} from "@/components/storefront/store-form";

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.success) toast.success("Profile updated");
    });
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startPasswordTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Password updated");
      form.reset();
    });
  }

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6">
      <StoreSectionCard
        title="Account"
        description="Your login email and membership details."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <StoreFormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email ?? ""}
              readOnly
              disabled
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField label="Member since" htmlFor="member_since">
            <Input
              id="member_since"
              value={memberSince}
              readOnly
              disabled
              className={storeInputClassName}
            />
          </StoreFormField>
        </div>
      </StoreSectionCard>

      <StoreSectionCard
        title="Personal information"
        description="How we address you and reach you about orders."
      >
        <form
          onSubmit={handleProfileSubmit}
          className="grid max-w-xl gap-4 sm:grid-cols-2"
        >
          <StoreFormField
            label="Full name"
            htmlFor="full_name"
            className="sm:col-span-2"
          >
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile.full_name ?? ""}
              placeholder="Your full name"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField
            label="Phone"
            htmlFor="phone"
            className="sm:col-span-2"
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              placeholder="03XX XXXXXXX"
              className={storeInputClassName}
            />
          </StoreFormField>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isPending}
              variant="kraft"
            >
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </StoreSectionCard>

      <StoreSectionCard
        title="Security"
        description="Update your password. Use at least 6 characters."
      >
        <form
          onSubmit={handlePasswordSubmit}
          noValidate
          className="grid max-w-xl gap-4 sm:grid-cols-2"
        >
          <StoreFormField
            label="Current password"
            htmlFor="current_password"
            className="sm:col-span-2"
            required
          >
            <PasswordInput
              id="current_password"
              name="current_password"
              aria-required
              autoComplete="current-password"
              placeholder="Enter current password"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField label="New password" htmlFor="password" required>
            <PasswordInput
              id="password"
              name="password"
              aria-required
              autoComplete="new-password"
              placeholder="New password"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField
            label="Confirm new password"
            htmlFor="confirm_password"
            required
          >
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              aria-required
              autoComplete="new-password"
              placeholder="Confirm new password"
              className={storeInputClassName}
            />
          </StoreFormField>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={passwordPending}
              variant="outline"
              className="border-kraft-ink/20"
            >
              {passwordPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </StoreSectionCard>
    </div>
  );
}
