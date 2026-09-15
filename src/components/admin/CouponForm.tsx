"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminFormShell,
  AdminFormSection,
  FieldError,
} from "@/components/admin/AdminFormShell";
import { createCoupon, updateCoupon } from "@/lib/actions/coupons";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";
import type { Coupon } from "@/types/database";

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"percentage" | "fixed">(
    coupon?.type ?? "percentage",
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = Boolean(coupon);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);

    startTransition(async () => {
      const result = isEdit
        ? await updateCoupon(coupon!.id, formData)
        : await createCoupon(formData);
      if (result.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save coupon");
      } else {
        setErrors({});
        toast.success(isEdit ? "Coupon updated" : "Coupon created");
        router.push("/admin/coupons");
      }
    });
  }

  const expiresDefault = coupon?.expires_at
    ? coupon.expires_at.slice(0, 16)
    : "";

  return (
    <AdminFormShell
      title={isEdit ? "Edit coupon" : "Create coupon"}
      description="Discount codes for checkout."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection title="Code & discount">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              required
              className="uppercase"
              defaultValue={coupon?.code}
              aria-invalid={!!errors.code}
            />
            <FieldError message={errors.code} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
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
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              required
              defaultValue={coupon?.value}
              aria-invalid={!!errors.value}
            />
            <FieldError message={errors.value} />
          </div>
        </AdminFormSection>

        <AdminFormSection title="Limits">
          <div className="space-y-2">
            <Label htmlFor="min_order">Minimum Order</Label>
            <Input
              id="min_order"
              name="min_order"
              type="number"
              step="0.01"
              defaultValue={coupon?.min_order ?? undefined}
              aria-invalid={!!errors.min_order}
            />
            <FieldError message={errors.min_order} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_uses">Max Uses</Label>
            <Input
              id="max_uses"
              name="max_uses"
              type="number"
              defaultValue={coupon?.max_uses ?? undefined}
              aria-invalid={!!errors.max_uses}
            />
            <FieldError message={errors.max_uses} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expires At</Label>
            <Input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              defaultValue={expiresDefault}
              aria-invalid={!!errors.expires_at}
            />
            <FieldError message={errors.expires_at} />
          </div>
        </AdminFormSection>

        <input
          type="hidden"
          name="is_active"
          value={coupon?.is_active === false ? "false" : "true"}
        />

        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
          >
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create Coupon"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/coupons">Cancel</Link>
          </Button>
        </div>
      </form>
    </AdminFormShell>
  );
}
