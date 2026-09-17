"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
  FieldLabel,
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
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <AdminFormSection title="Store">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <FieldLabel htmlFor="store_name" required>Store Name</FieldLabel>
              <Input
                id="store_name"
                name="store_name"
                defaultValue={String(settings.store_name ?? "")}
                aria-invalid={!!errors.store_name}
              />
              <FieldError message={errors.store_name} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="currency" required>Currency</FieldLabel>
              <Input
                id="currency"
                name="currency"
                defaultValue={String(settings.currency ?? "PKR")}
                aria-invalid={!!errors.currency}
              />
              <FieldError message={errors.currency} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="shipping_flat_rate" required>Shipping Rate (PKR)</FieldLabel>
              <NumericInput
                id="shipping_flat_rate"
                name="shipping_flat_rate"
                decimal
                defaultValue={String(settings.shipping_flat_rate ?? 200)}
                aria-invalid={!!errors.shipping_flat_rate}
              />
              <FieldError message={errors.shipping_flat_rate} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="contact_email" required>Contact Email</FieldLabel>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={String(settings.contact_email ?? "")}
                aria-invalid={!!errors.contact_email}
              />
              <FieldError message={errors.contact_email} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="contact_phone" required>Contact Phone</FieldLabel>
              <Input
                id="contact_phone"
                name="contact_phone"
                defaultValue={String(settings.contact_phone ?? "")}
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
              <FieldLabel htmlFor="bank" required>Bank</FieldLabel>
              <Input
                id="bank"
                name="bank"
                defaultValue={bank.bank ?? ""}
                aria-invalid={!!errors.bank}
              />
              <FieldError message={errors.bank} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="account_title" required>Account Title</FieldLabel>
              <Input
                id="account_title"
                name="account_title"
                defaultValue={bank.account_title ?? ""}
                aria-invalid={!!errors.account_title}
              />
              <FieldError message={errors.account_title} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="account_number" required>Account Number</FieldLabel>
              <Input
                id="account_number"
                name="account_number"
                defaultValue={bank.account_number ?? ""}
                aria-invalid={!!errors.account_number}
              />
              <FieldError message={errors.account_number} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="iban" required>IBAN</FieldLabel>
              <Input
                id="iban"
                name="iban"
                defaultValue={bank.iban ?? ""}
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
                <FieldLabel htmlFor="jazzcash_account_title" required>Account Title</FieldLabel>
                <Input
                  id="jazzcash_account_title"
                  name="jazzcash_account_title"
                  defaultValue={jazzcash.account_title ?? ""}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="jazzcash_account_number" required>JazzCash Number</FieldLabel>
                <Input
                  id="jazzcash_account_number"
                  name="jazzcash_account_number"
                  defaultValue={jazzcash.account_number ?? ""}
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
                <FieldLabel htmlFor="easypaisa_account_title" required>Account Title</FieldLabel>
                <Input
                  id="easypaisa_account_title"
                  name="easypaisa_account_title"
                  defaultValue={easypaisa.account_title ?? ""}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="easypaisa_account_number" required>EasyPaisa Number</FieldLabel>
                <Input
                  id="easypaisa_account_number"
                  name="easypaisa_account_number"
                  defaultValue={easypaisa.account_number ?? ""}
                />
              </div>
            </div>
          </AdminFormSection>
        </div>

        <AdminFormActions>
          <Button
            type="submit"
            disabled={isPending}
            variant="kraft"
          >
            {isPending ? "Saving…" : "Save Settings"}
          </Button>
        </AdminFormActions>
      </form>
    </AdminFormShell>
  );
}
