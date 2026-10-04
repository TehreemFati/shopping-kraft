"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { AddressFields } from "@/components/storefront/AddressFields";
import { StoreSectionCard } from "@/components/storefront/store-form";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { usePendingAction } from "@/hooks/use-pending-action";
import {
  createAddress,
  deleteAddress,
  updateAddress,
} from "@/lib/actions/auth";
import { toast } from "sonner";
import type { Address } from "@/types/database";

export function AddressesPage({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | null>(null);
  const { isPending, run } = usePendingAction();
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
    const form = e.currentTarget;
    const formData = new FormData(form);
    run(async () => {
      const result = await createAddress(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Address saved");
        form.reset();
      }
    });
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    const id = editing.id;
    run(async () => {
      const result = await updateAddress(id, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Address updated");
        setEditing(null);
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
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending || isDeleting}
                    onClick={() => setEditing(addr)}
                    aria-label={`Edit ${addr.label || addr.line1}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending || isDeleting}
                    onClick={() =>
                      requestDelete(addr.id, addr.label || addr.line1)
                    }
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </StoreSectionCard>

      <StoreSectionCard
        title={editing ? "Edit address" : "Add new address"}
        description={
          editing
            ? "Update this saved delivery address."
            : "Save a home, office, or gift delivery address."
        }
      >
        <form
          key={editing?.id ?? "create"}
          onSubmit={editing ? handleUpdate : handleCreate}
          className="max-w-2xl space-y-4"
          noValidate
        >
          <AddressFields
            showMeta
            defaults={
              editing
                ? {
                    label: editing.label,
                    line1: editing.line1,
                    line2: editing.line2,
                    city: editing.city,
                    province: editing.province,
                    postal_code: editing.postal_code,
                    is_default: editing.is_default,
                  }
                : undefined
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={isPending} variant="kraft">
              {editing
                ? isPending
                  ? "Updating..."
                  : "Update address"
                : isPending
                  ? "Saving..."
                  : "Save address"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </StoreSectionCard>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
