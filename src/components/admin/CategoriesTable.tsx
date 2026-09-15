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
import { softDeleteCategory } from "@/lib/actions/categories";
import { toast } from "sonner";
import type { Category } from "@/types/database";

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    startTransition(async () => {
      await softDeleteCategory(id);
      toast.success("Category deleted");
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sort</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((cat) => (
          <TableRow key={cat.id}>
            <TableCell className="font-medium">{cat.name}</TableCell>
            <TableCell>{cat.slug}</TableCell>
            <TableCell>
              <Badge variant={cat.is_active ? "default" : "secondary"}>
                {cat.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>{cat.sort_order}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/categories/${cat.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => handleDelete(cat.id, cat.name)}
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
