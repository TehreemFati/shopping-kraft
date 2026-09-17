"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
  FieldLabel,
} from "@/components/admin/AdminFormShell";
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit";
import { createCoupon, updateCoupon } from "@/lib/actions/coupons";
import type { Coupon } from "@/types/database";

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const [type, setType] = useState<"percentage" | "fixed">(
    coupon?.type ?? "percentage",
  );
  const isEdit = Boolean(coupon);

  const { errors, setErrors, isPending, onSubmit } = useAdminFormSubmit({
    action: (formData) =>
      isEdit ? updateCoupon(coupon!.id, formData) : createCoupon(formData),
    successMessage: isEdit ? "Coupon updated" : "Coupon created",
    redirectTo: "/admin/coupons",
    failureFallback: "Failed to save coupon",
    prepareFormData: (formData) => {
      formData.set("type", type);
    },
  });

  const expiresDefault = coupon?.expires_at
    ? coupon.expires_at.slice(0, 16)
    : "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(fd.get("code") ?? "").trim()) next.code = "Code is required";
    if (!String(fd.get("value") ?? "").trim()) next.value = "Value is required";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSubmit(e);
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <AdminFormSection title="Code & discount">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <FieldLabel htmlFor="code" required>
                Code
              </FieldLabel>
              <Input
                id="code"
                name="code"
                className="uppercase"
                defaultValue={coupon?.code}
                aria-invalid={!!errors.code}
                aria-required
              />
              <FieldError message={errors.code} />
            </div>
            <div className="space-y-2">
              <FieldLabel required>Type</FieldLabel>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "percentage" | "fixed")}
              >
                <SelectTrigger aria-invalid={!!errors.type}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.type} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="value" required>
                Value
              </FieldLabel>
              <NumericInput
                id="value"
                name="value"
                decimal
                defaultValue={coupon?.value}
                aria-invalid={!!errors.value}
                aria-required
              />
              <FieldError message={errors.value} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="Limits">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <FieldLabel htmlFor="min_order">Minimum Order</FieldLabel>
              <NumericInput
                id="min_order"
                name="min_order"
                decimal
                defaultValue={coupon?.min_order ?? undefined}
                aria-invalid={!!errors.min_order}
              />
              <FieldError message={errors.min_order} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="max_uses">Max Uses</FieldLabel>
              <NumericInput
                id="max_uses"
                name="max_uses"
                decimal={false}
                defaultValue={coupon?.max_uses ?? undefined}
                aria-invalid={!!errors.max_uses}
              />
              <FieldError message={errors.max_uses} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="expires_at">Expires At</FieldLabel>
              <Input
                id="expires_at"
                name="expires_at"
                type="datetime-local"
                defaultValue={expiresDefault}
                aria-invalid={!!errors.expires_at}
              />
              <FieldError message={errors.expires_at} />
            </div>
          </div>
        </AdminFormSection>

        <input
          type="hidden"
          name="is_active"
          value={coupon?.is_active === false ? "false" : "true"}
        />

        <AdminFormActions>
          <Button type="submit" disabled={isPending} variant="kraft">
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create Coupon"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/coupons">Cancel</Link>
          </Button>
        </AdminFormActions>
      </form>
    </AdminFormShell>
  );
}
