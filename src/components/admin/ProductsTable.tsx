"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { softDeleteProduct } from "@/lib/actions/products";
import type { AdminProduct } from "@/types/database";
import { formatPrice } from "@/lib/utils/format";

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const { isPending, requestDelete, dialogProps } = useConfirmDelete({
    onDelete: softDeleteProduct,
    successMessage: "Product deleted",
    title: "Delete product?",
    descriptionTemplate:
      "Delete “{label}”? It will be removed from the storefront.",
  });

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
                <StatusBadge active={product.is_active} />
              </TableCell>
              <TableCell className="text-right">
                <AdminRowActions
                  editHref={`/admin/products/${product.id}/edit`}
                  editStyle="icon"
                  deleteDisabled={isPending}
                  onDelete={() => requestDelete(product.id, product.name)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
