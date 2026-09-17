"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { AddressFields } from "@/components/storefront/AddressFields";
import {
  StoreSectionCard,
} from "@/components/storefront/store-form";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { createAddress, deleteAddress } from "@/lib/actions/auth";
import { toast } from "sonner";
import type { Address } from "@/types/database";

export function AddressesPage({ addresses }: { addresses: Address[] }) {
  const [isPending, startTransition] = useTransition();
  const { isPending: isDeleting, requestDelete, dialogProps } =
    useConfirmDelete({
      onDelete: deleteAddress,
      successMessage: "Address removed",
      title: "Remove address?",
      descriptionTemplate: "Remove “{label}” from your saved addresses?",
      confirmLabel: "Remove",
    });

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

  return (
    <div className="space-y-6">
      <StoreSectionCard
        title="Saved addresses"
        description="Addresses you can use quickly at checkout."
      >
        {addresses.length === 0 ? (
          <EmptyState title="No saved addresses yet." />
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
                  disabled={isPending || isDeleting}
                  onClick={() =>
                    requestDelete(addr.id, addr.label || addr.line1)
                  }
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
        <form onSubmit={handleCreate} className="max-w-2xl space-y-4">
          <AddressFields showMeta />
          <Button type="submit" disabled={isPending} variant="kraft">
            {isPending ? "Saving..." : "Save address"}
          </Button>
        </form>
      </StoreSectionCard>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
