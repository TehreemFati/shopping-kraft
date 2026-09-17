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
import { softDeleteBanner } from "@/lib/actions/banners";
import type { Banner } from "@/types/database";

export function BannersTable({ banners }: { banners: Banner[] }) {
  const { isPending, requestDelete, dialogProps } = useConfirmDelete({
    onDelete: softDeleteBanner,
    successMessage: "Banner deleted",
    title: "Delete banner?",
    descriptionTemplate:
      "Delete “{label}”? It will no longer appear on the homepage.",
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Sort</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell className="font-medium">{banner.title}</TableCell>
              <TableCell>{banner.sort_order}</TableCell>
              <TableCell>
                <StatusBadge active={banner.is_active} />
              </TableCell>
              <TableCell className="text-right">
                <AdminRowActions
                  editHref={`/admin/banners/${banner.id}/edit`}
                  editStyle="text"
                  deleteDisabled={isPending}
                  onDelete={() => requestDelete(banner.id, banner.title)}
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
