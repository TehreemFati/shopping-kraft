"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { softDeleteCoupon } from "@/lib/actions/coupons";
import type { Coupon } from "@/types/database";

export function CouponsTable({ coupons }: { coupons: Coupon[] }) {
  const { isPending, requestDelete, dialogProps } = useConfirmDelete({
    onDelete: softDeleteCoupon,
    successMessage: "Coupon deleted",
    title: "Delete coupon?",
    descriptionTemplate:
      "Delete coupon “{label}”? Customers will no longer be able to use it.",
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
              <TableCell>{coupon.type}</TableCell>
              <TableCell>
                {coupon.type === "percentage"
                  ? `${coupon.value}%`
                  : `PKR ${coupon.value}`}
              </TableCell>
              <TableCell>
                {coupon.used_count}
                {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
              </TableCell>
              <TableCell>
                <StatusBadge active={coupon.is_active} />
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/coupons/${coupon.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => requestDelete(coupon.id, coupon.code)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
