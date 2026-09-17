"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Pencil, Ban, CheckCircle, Trash2 } from "lucide-react";
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
import { setStaffActive, softDeleteStaff } from "@/lib/actions/staff";
import { toast } from "sonner";
import type { StaffMember } from "@/types/database";

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const [isToggling, startToggle] = useTransition();
  const { isPending, requestDelete, dialogProps } = useConfirmDelete({
    onDelete: softDeleteStaff,
    successMessage: "Staff deleted",
    title: "Delete staff?",
    descriptionTemplate:
      "Soft-delete “{label}”? They will lose admin access.",
  });

  function handleToggle(id: string, currentlyActive: boolean) {
    startToggle(async () => {
      const result = await setStaffActive(id, !currentlyActive);
      if (result.error) toast.error(result.error);
      else toast.success(currentlyActive ? "Staff disabled" : "Staff enabled");
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => {
            const active = member.staff_permissions?.is_active ?? false;
            const perms = member.staff_permissions?.permissions ?? [];
            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.full_name ?? "—"}
                </TableCell>
                <TableCell>{member.email ?? "—"}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {perms.length} permission{perms.length === 1 ? "" : "s"}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    active={active}
                    inactiveLabel="Disabled"
                  />
                </TableCell>
                <TableCell className="space-x-1 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/staff/${member.id}`}>
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isToggling || isPending}
                    onClick={() => handleToggle(member.id, active)}
                  >
                    {active ? (
                      <>
                        <Ban className="mr-1 h-3 w-3" />
                        Disable
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() =>
                      requestDelete(member.id, member.full_name ?? "staff")
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
