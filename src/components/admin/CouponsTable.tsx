"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
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
import { softDeleteCoupon } from "@/lib/actions/coupons";
import { toast } from "sonner";
import type { Coupon } from "@/types/database";

export function CouponsTable({ coupons }: { coupons: Coupon[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    startTransition(async () => {
      await softDeleteCoupon(id);
      toast.success("Coupon deleted");
    });
  }

  return (
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
              <Badge variant={coupon.is_active ? "default" : "secondary"}>
                {coupon.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/coupons/${coupon.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => handleDelete(coupon.id, coupon.code)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
