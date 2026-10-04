"use client";

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
              <TableCell className="text-right">
                <AdminRowActions
                  editHref={`/admin/sales/${sale.id}/edit`}
                  editStyle="text"
                  deleteDisabled={isPending}
                  onDelete={() => requestDelete(sale.id, sale.name)}
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
