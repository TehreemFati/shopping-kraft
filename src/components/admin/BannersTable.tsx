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
import { softDeleteBanner } from "@/lib/actions/banners";
import { toast } from "sonner";
import type { Banner } from "@/types/database";

export function BannersTable({ banners }: { banners: Banner[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete banner "${title}"?`)) return;
    startTransition(async () => {
      await softDeleteBanner(id);
      toast.success("Banner deleted");
    });
  }

  return (
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
              <Badge variant={banner.is_active ? "default" : "secondary"}>
                {banner.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="space-x-1 text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/banners/${banner.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => handleDelete(banner.id, banner.title)}
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
