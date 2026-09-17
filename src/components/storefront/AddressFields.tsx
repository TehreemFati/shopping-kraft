"use client";

import { Input } from "@/components/ui/input";
import {
  StoreFormField,
  storeInputClassName,
} from "@/components/storefront/store-form";
import { cn } from "@/lib/utils";

type AddressFieldsProps = {
  /** Show label + default checkbox (account addresses). */
  showMeta?: boolean;
  className?: string;
  defaults?: {
    label?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    province?: string | null;
    postal_code?: string | null;
  };
};

export function AddressFields({
  showMeta = false,
  className,
  defaults,
}: AddressFieldsProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {showMeta ? (
        <StoreFormField
          label="Label"
          htmlFor="label"
          className="sm:col-span-2"
        >
          <Input
            id="label"
            name="label"
            placeholder="Home, Office…"
            defaultValue={defaults?.label ?? ""}
            className={storeInputClassName}
          />
        </StoreFormField>
      ) : null}
      <StoreFormField
        label="Address line 1"
        htmlFor="line1"
        className="sm:col-span-2"
        required
      >
        <Input
          id="line1"
          name="line1"
          aria-required
          placeholder="Street address"
          defaultValue={defaults?.line1 ?? ""}
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
          defaultValue={defaults?.line2 ?? ""}
          className={storeInputClassName}
        />
      </StoreFormField>
      <StoreFormField label="City" htmlFor="city" required>
        <Input
          id="city"
          name="city"
          aria-required
          placeholder="City"
          defaultValue={defaults?.city ?? ""}
          className={storeInputClassName}
        />
      </StoreFormField>
      <StoreFormField label="Province" htmlFor="province" required>
        <Input
          id="province"
          name="province"
          aria-required
          placeholder="Province"
          defaultValue={defaults?.province ?? ""}
          className={storeInputClassName}
        />
      </StoreFormField>
      <StoreFormField label="Postal code" htmlFor="postal_code">
        <Input
          id="postal_code"
          name="postal_code"
          placeholder="Optional"
          defaultValue={defaults?.postal_code ?? ""}
          className={storeInputClassName}
        />
      </StoreFormField>
      {showMeta ? (
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="is_default"
            name="is_default"
            type="checkbox"
            className="size-4 rounded border-kraft-ink/25 text-kraft-ink accent-kraft-ink"
          />
          <label htmlFor="is_default" className="text-sm text-kraft-ink/85">
            Set as default address
          </label>
        </div>
      ) : null}
    </div>
  );
}
