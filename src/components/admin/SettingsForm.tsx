"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
} from "@/components/admin/AdminFormShell";
import { updateSettings } from "@/lib/actions/auth";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";

interface SettingsFormProps {
  settings: Record<string, unknown>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const bank = (settings.bank_account ?? {}) as Record<string, string>;
  const jazzcash = (settings.jazzcash_account ?? {}) as Record<string, string>;
  const easypaisa = (settings.easypaisa_account ?? {}) as Record<string, string>;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateSettings(formData);
      if (result?.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save settings");
      } else {
        setErrors({});
        toast.success("Settings saved");
      }
    });
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection title="Store">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                name="store_name"
                defaultValue={String(settings.store_name ?? "")}
                required
                aria-invalid={!!errors.store_name}
              />
              <FieldError message={errors.store_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={String(settings.currency ?? "PKR")}
                required
                aria-invalid={!!errors.currency}
              />
              <FieldError message={errors.currency} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_flat_rate">Shipping Rate (PKR)</Label>
              <Input
                id="shipping_flat_rate"
                name="shipping_flat_rate"
                type="number"
                defaultValue={String(settings.shipping_flat_rate ?? 200)}
                required
                aria-invalid={!!errors.shipping_flat_rate}
              />
              <FieldError message={errors.shipping_flat_rate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={String(settings.contact_email ?? "")}
                required
                aria-invalid={!!errors.contact_email}
              />
              <FieldError message={errors.contact_email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                defaultValue={String(settings.contact_phone ?? "")}
                required
                aria-invalid={!!errors.contact_phone}
              />
              <FieldError message={errors.contact_phone} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Bank account"
          description="For bank transfer checkout."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank">Bank</Label>
              <Input
                id="bank"
                name="bank"
                defaultValue={bank.bank ?? ""}
                required
                aria-invalid={!!errors.bank}
              />
              <FieldError message={errors.bank} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_title">Account Title</Label>
              <Input
                id="account_title"
                name="account_title"
                defaultValue={bank.account_title ?? ""}
                required
                aria-invalid={!!errors.account_title}
              />
              <FieldError message={errors.account_title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                name="account_number"
                defaultValue={bank.account_number ?? ""}
                required
                aria-invalid={!!errors.account_number}
              />
              <FieldError message={errors.account_number} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                name="iban"
                defaultValue={bank.iban ?? ""}
                required
                aria-invalid={!!errors.iban}
              />
              <FieldError message={errors.iban} />
            </div>
          </div>
        </AdminFormSection>

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminFormSection
            title="JazzCash"
            description="Shown at checkout for JazzCash payments."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jazzcash_account_title">Account Title</Label>
                <Input
                  id="jazzcash_account_title"
                  name="jazzcash_account_title"
                  defaultValue={jazzcash.account_title ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jazzcash_account_number">JazzCash Number</Label>
                <Input
                  id="jazzcash_account_number"
                  name="jazzcash_account_number"
                  defaultValue={jazzcash.account_number ?? ""}
                  required
                />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection
            title="EasyPaisa"
            description="Shown at checkout for EasyPaisa payments."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="easypaisa_account_title">Account Title</Label>
                <Input
                  id="easypaisa_account_title"
                  name="easypaisa_account_title"
                  defaultValue={easypaisa.account_title ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="easypaisa_account_number">EasyPaisa Number</Label>
                <Input
                  id="easypaisa_account_number"
                  name="easypaisa_account_number"
                  defaultValue={easypaisa.account_number ?? ""}
                  required
                />
              </div>
            </div>
          </AdminFormSection>
        </div>

        <AdminFormActions>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
          >
            {isPending ? "Saving…" : "Save Settings"}
          </Button>
        </AdminFormActions>
      </form>
    </AdminFormShell>
  );
}
