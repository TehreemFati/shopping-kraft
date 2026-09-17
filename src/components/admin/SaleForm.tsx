"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { NumericInput } from "@/components/ui/numeric-input";
import { SlugInput } from "@/components/admin/SlugInput";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
  FieldLabel,
} from "@/components/admin/AdminFormShell";
import {
  createSaleCampaign,
  updateSaleCampaign,
} from "@/lib/actions/sales";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";
import type { SaleCampaign, SaleCampaignType } from "@/types/database";

type ProductOption = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
};

type SaleEdit = SaleCampaign & {
  product_ids: string[];
  product_prices: Record<string, number | null>;
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SaleForm({
  sale,
  products,
}: {
  sale?: SaleEdit;
  products: ProductOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [name, setName] = useState(sale?.name ?? "");
  const [isActive, setIsActive] = useState(sale?.is_active ?? true);
  const [selected, setSelected] = useState<string[]>(sale?.product_ids ?? []);
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const [id, price] of Object.entries(sale?.product_prices ?? {})) {
      if (price !== null && price !== undefined) init[id] = String(price);
    }
    return init;
  });
  const isEdit = Boolean(sale);

  function toggleProduct(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_active", isActive ? "true" : "false");
    formData.delete("product_ids");
    for (const id of selected) {
      formData.append("product_ids", id);
      if (prices[id]?.trim()) formData.set(`price_${id}`, prices[id]);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateSaleCampaign(sale!.id, formData)
        : await createSaleCampaign(formData);
      if (result.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save sale");
      } else {
        setErrors({});
        toast.success(isEdit ? "Sale updated" : "Sale created");
        router.push("/admin/sales");
      }
    });
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <AdminFormSection title="Campaign">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="name" required>Name</FieldLabel>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              <FieldError message={errors.name} />
            </div>
            <div>
              <SlugInput
                name="slug"
                required
                sourceValue={name}
                defaultValue={sale?.slug}
              />
              <FieldError message={errors.slug} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="sale_type" required>Sale type</FieldLabel>
              <select
                id="sale_type"
                name="sale_type"
                defaultValue={(sale?.sale_type as SaleCampaignType) ?? "flash"}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                aria-invalid={!!errors.sale_type}
              >
                <option value="flash">Flash</option>
                <option value="seasonal">Seasonal</option>
                <option value="clearance">Clearance</option>
                <option value="custom">Custom</option>
              </select>
              <FieldError message={errors.sale_type} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(v) => setIsActive(Boolean(v))}
              />
              <FieldLabel htmlFor="is_active">Active</FieldLabel>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="starts_at">Starts at</FieldLabel>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                defaultValue={toLocalInput(sale?.starts_at ?? null)}
                aria-invalid={!!errors.starts_at}
              />
              <FieldError message={errors.starts_at} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="ends_at">Ends at</FieldLabel>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                defaultValue={toLocalInput(sale?.ends_at ?? null)}
                aria-invalid={!!errors.ends_at}
              />
              <FieldError message={errors.ends_at} />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={sale?.description ?? ""}
              aria-invalid={!!errors.description}
            />
            <FieldError message={errors.description} />
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Products"
          description="Select items and optional campaign prices."
        >
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products available. Add products first.
              </p>
            ) : (
              products.map((p) => {
                const checked = selected.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center gap-3 border-b py-2 last:border-0"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        toggleProduct(p.id, Boolean(v))
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        PKR {p.price}
                        {p.sale_price != null
                          ? ` · sale ${p.sale_price}`
                          : ""}
                      </p>
                    </div>
                    {checked ? (
                      <NumericInput
                        className="w-28"
                        decimal
                        placeholder="Campaign $"
                        value={prices[p.id] ?? ""}
                        onValueChange={(v) =>
                          setPrices((prev) => ({
                            ...prev,
                            [p.id]: v,
                          }))
                        }
                      />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
          <FieldError message={errors.product_ids} />
        </AdminFormSection>

        <AdminFormActions>
          <Button
            type="submit"
            disabled={isPending}
            variant="kraft"
          >
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create sale"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/sales">Cancel</Link>
          </Button>
        </AdminFormActions>
      </form>
    </AdminFormShell>
  );
}
