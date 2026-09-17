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
import { softDeleteSaleCampaign } from "@/lib/actions/sales";
import type { SaleCampaign } from "@/types/database";

export function SalesTable({ campaigns }: { campaigns: SaleCampaign[] }) {
  const { isPending, requestDelete, dialogProps } = useConfirmDelete({
    onDelete: softDeleteSaleCampaign,
    successMessage: "Sale deleted",
    title: "Delete sale?",
    descriptionTemplate:
      "Delete sale “{label}”? Campaign pricing will stop applying.",
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.name}</TableCell>
              <TableCell className="capitalize">{sale.sale_type}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {sale.starts_at
                  ? new Date(sale.starts_at).toLocaleDateString()
                  : "—"}
                {" → "}
                {sale.ends_at
                  ? new Date(sale.ends_at).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <StatusBadge active={sale.is_active} />
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/sales/${sale.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => requestDelete(sale.id, sale.name)}
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
