"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createVariant,
  softDeleteVariant,
} from "@/lib/actions/variants";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { NumericInput } from "@/components/ui/numeric-input";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { toast } from "sonner";
import type { ProductVariant } from "@/types/database";
import { formatPrice } from "@/lib/utils/format";

export function VariantsManager({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const { isPending: isDeleting, requestDelete, dialogProps } =
    useConfirmDelete({
      onDelete: (id) => softDeleteVariant(id, productId),
      successMessage: "Variant deleted",
      title: "Delete variant?",
      descriptionTemplate: "Delete variant “{label}”?",
    });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createVariant(productId, formData);
      if (result.error) {
        const errors = Object.values(result.error).flat();
        toast.error(String(errors[0] ?? "Failed to create variant"));
      } else {
        toast.success("Variant created");
        setOpen(false);
        e.currentTarget.reset();
      }
    });
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Variants</h2>
        <Button type="button" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Cancel" : "Add variant"}
        </Button>
      </div>

      {open && (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="variant_name">Name</Label>
            <Input id="variant_name" name="name" required placeholder="e.g. Red / M" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant_sku">SKU</Label>
            <Input id="variant_sku" name="sku" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant_price">Price override</Label>
            <NumericInput id="variant_price" name="price" decimal />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant_stock">Stock</Label>
            <NumericInput id="variant_stock" name="stock" defaultValue={0} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="kraft" disabled={isPending}>
              {isPending ? "Saving..." : "Create variant"}
            </Button>
          </div>
        </form>
      )}

      {variants.length === 0 ? (
        <EmptyState title="No variants yet." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.name}</TableCell>
                <TableCell>{variant.sku ?? "—"}</TableCell>
                <TableCell>
                  {variant.price != null ? formatPrice(variant.price) : "—"}
                </TableCell>
                <TableCell>{variant.stock}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => requestDelete(variant.id, variant.name)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
