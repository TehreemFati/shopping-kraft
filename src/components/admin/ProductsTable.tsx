"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { softDeleteProduct } from "@/lib/actions/products";
import type { AdminProduct } from "@/types/database";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "sonner";

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function confirmDelete() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    startTransition(async () => {
      await softDeleteProduct(id);
      toast.success("Product deleted");
      setPendingDelete(null);
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.categories?.name ?? "—"}</TableCell>
              <TableCell>{formatPrice(product.price)}</TableCell>
              <TableCell>{product.inventory?.[0]?.quantity ?? 0}</TableCell>
              <TableCell>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() =>
                    setPendingDelete({ id: product.id, name: product.name })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete product?"
        description={
          pendingDelete
            ? `Delete “${pendingDelete.name}”? It will be removed from the storefront.`
            : undefined
        }
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
