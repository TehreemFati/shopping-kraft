"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Pencil, Ban, CheckCircle, Trash2 } from "lucide-react";
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
import {
  setStaffActive,
  softDeleteStaff,
} from "@/lib/actions/staff";
import { toast } from "sonner";
import type { StaffMember } from "@/types/database";

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, currentlyActive: boolean) {
    startTransition(async () => {
      const result = await setStaffActive(id, !currentlyActive);
      if (result.error) toast.error(result.error);
      else toast.success(currentlyActive ? "Staff disabled" : "Staff enabled");
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Soft-delete staff "${name}"? They will lose admin access.`)) return;
    startTransition(async () => {
      const result = await softDeleteStaff(id);
      if ("error" in result) toast.error(String(result.error));
      else toast.success("Staff deleted");
    });
  }

  return (
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
                <Badge variant={active ? "default" : "secondary"}>
                  {active ? "Active" : "Disabled"}
                </Badge>
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
                  disabled={isPending}
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
                    handleDelete(member.id, member.full_name ?? "staff")
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
  );
}
