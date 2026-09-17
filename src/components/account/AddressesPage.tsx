"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAddress, deleteAddress } from "@/lib/actions/auth";
import { toast } from "sonner";
import type { Address } from "@/types/database";
import {
  StoreFormField,
  StoreSectionCard,
  storeInputClassName,
} from "@/components/storefront/store-form";

export function AddressesPage({ addresses }: { addresses: Address[] }) {
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAddress(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Address saved");
        e.currentTarget.reset();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAddress(id);
      toast.success("Address removed");
    });
  }

  return (
    <div className="space-y-6">
      <StoreSectionCard
        title="Saved addresses"
        description="Addresses you can use quickly at checkout."
      >
        {addresses.length === 0 ? (
          <p className="text-muted-foreground">No saved addresses yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-kraft-ink/10 bg-kraft-mist/30 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {addr.label ? (
                      <p className="font-medium text-kraft-ink">{addr.label}</p>
                    ) : null}
                    {addr.is_default ? (
                      <span className="rounded-md bg-kraft-citrus/80 px-2 py-0.5 text-xs font-medium text-kraft-ink">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-kraft-ink/80">{addr.line1}</p>
                  {addr.line2 ? (
                    <p className="text-sm text-kraft-ink/80">{addr.line2}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {addr.city}, {addr.province}
                    {addr.postal_code ? ` ${addr.postal_code}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(addr.id)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </StoreSectionCard>

      <StoreSectionCard
        title="Add new address"
        description="Save a home, office, or gift delivery address."
      >
        <form
          onSubmit={handleCreate}
          className="grid max-w-2xl gap-4 sm:grid-cols-2"
        >
          <StoreFormField
            label="Label"
            htmlFor="label"
            className="sm:col-span-2"
          >
            <Input
              id="label"
              name="label"
              placeholder="Home, Office…"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField
            label="Address line 1"
            htmlFor="line1"
            className="sm:col-span-2"
          >
            <Input
              id="line1"
              name="line1"
              required
              placeholder="Street address"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField
            label="Address line 2"
            htmlFor="line2"
            className="sm:col-span-2"
            hint="Apartment, suite, landmark — optional"
          >
            <Input
              id="line2"
              name="line2"
              placeholder="Apartment, floor, landmark…"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField label="City" htmlFor="city">
            <Input
              id="city"
              name="city"
              required
              placeholder="City"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField label="Province" htmlFor="province">
            <Input
              id="province"
              name="province"
              required
              placeholder="Province"
              className={storeInputClassName}
            />
          </StoreFormField>
          <StoreFormField label="Postal code" htmlFor="postal_code">
            <Input
              id="postal_code"
              name="postal_code"
              placeholder="Optional"
              className={storeInputClassName}
            />
          </StoreFormField>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="is_default"
              name="is_default"
              type="checkbox"
              className="size-4 rounded border-kraft-ink/25 text-kraft-ink accent-kraft-ink"
            />
            <label
              htmlFor="is_default"
              className="text-sm text-kraft-ink/85"
            >
              Set as default address
            </label>
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
            >
              {isPending ? "Saving..." : "Save address"}
            </Button>
          </div>
        </form>
      </StoreSectionCard>
    </div>
  );
}
