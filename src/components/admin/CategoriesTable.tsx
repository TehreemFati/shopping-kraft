"use client";

import { useMemo, useTransition } from "react";
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

function sortHierarchical(categories: Category[]): Category[] {
  const byParent = new Map<string | null, Category[]>();
  for (const cat of categories) {
    const key = cat.parent_id ?? null;
    const list = byParent.get(key) ?? [];
    list.push(cat);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort(
      (a, b) =>
        a.sort_order - b.sort_order || a.name.localeCompare(b.name),
    );
  }

  const result: Category[] = [];
  const roots = byParent.get(null) ?? [];
  const placed = new Set<string>();

  for (const root of roots) {
    result.push(root);
    placed.add(root.id);
    for (const child of byParent.get(root.id) ?? []) {
      result.push(child);
      placed.add(child.id);
    }
  }

  for (const cat of categories) {
    if (!placed.has(cat.id)) result.push(cat);
  }

  return result;
}

export function CategoriesTable({
  categories,
  allCategories = [],
}: {
  categories: Category[];
  /** Full list for parent name lookup across pages. */
  allCategories?: Category[];
}) {
  const [isPending, startTransition] = useTransition();
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of allCategories.length ? allCategories : categories) {
      map.set(c.id, c.name);
    }
    return map;
  }, [allCategories, categories]);

  const rows = useMemo(() => sortHierarchical(categories), [categories]);

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
          <TableHead>Parent</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sort</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((cat) => {
          const isChild = Boolean(cat.parent_id);
          const parentName = cat.parent_id
            ? (nameById.get(cat.parent_id) ?? "—")
            : "—";
          return (
            <TableRow key={cat.id}>
              <TableCell
                className={`font-medium ${isChild ? "pl-8 text-muted-foreground" : ""}`}
              >
                <span className="inline-flex items-center gap-2">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt=""
                      className="size-8 rounded object-cover"
                    />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                      —
                    </span>
                  )}
                  {isChild ? `↳ ${cat.name}` : cat.name}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {parentName}
              </TableCell>
              <TableCell>{cat.slug}</TableCell>
              <TableCell>
                <Badge variant={cat.is_active ? "default" : "secondary"}>
                  {cat.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{cat.sort_order}</TableCell>
              <TableCell className="space-x-1 text-right">
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
          );
        })}
      </TableBody>
    </Table>
  );
}
