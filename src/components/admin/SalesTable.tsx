"use client";

import { useState, useTransition } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { softDeleteSaleCampaign } from "@/lib/actions/sales";
import { toast } from "sonner";
import type { SaleCampaign } from "@/types/database";

export function SalesTable({ campaigns }: { campaigns: SaleCampaign[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function confirmDelete() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    startTransition(async () => {
      await softDeleteSaleCampaign(id);
      toast.success("Sale deleted");
      setPendingDelete(null);
    });
  }

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
                <Badge variant={sale.is_active ? "default" : "secondary"}>
                  {sale.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/sales/${sale.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() =>
                    setPendingDelete({ id: sale.id, name: sale.name })
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
        title="Delete sale?"
        description={
          pendingDelete
            ? `Delete sale “${pendingDelete.name}”? Campaign pricing will stop applying.`
            : undefined
        }
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
