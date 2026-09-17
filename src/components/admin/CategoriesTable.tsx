"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderTree, Pencil, Trash2 } from "lucide-react";
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
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { SubcategoriesSheet } from "@/components/admin/SubcategoriesSheet";
import {
  softDeleteCategory,
  type AdminCategoryRow,
} from "@/lib/actions/categories";
import { toast } from "sonner";
import type { Category } from "@/types/database";

export function CategoriesTable({
  categories,
  allCategories = [],
  initialEditId,
}: {
  categories: AdminCategoryRow[];
  allCategories?: Category[];
  /** Open edit dialog for this root id (from ?edit=). */
  initialEditId?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [shelvesParent, setShelvesParent] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  useEffect(() => {
    if (!initialEditId) return;
    const found =
      categories.find((c) => c.id === initialEditId) ??
      allCategories.find((c) => c.id === initialEditId && !c.parent_id);
    if (found) {
      setEditing(found);
      setDialogOpen(true);
      router.replace("/admin/categories", { scroll: false });
    }
  }, [initialEditId, categories, allCategories, router]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setDialogOpen(true);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startTransition(async () => {
      await softDeleteCategory(id);
      toast.success("Category deleted");
      setPendingDelete(null);
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={openCreate}
          className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
        >
          Add Category
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Shelves</TableHead>
            <TableHead>Sort</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">
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
                  {cat.name}
                </span>
              </TableCell>
              <TableCell>{cat.slug}</TableCell>
              <TableCell>
                <Badge variant={cat.is_active ? "default" : "secondary"}>
                  {cat.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {cat.child_count}
                </span>
              </TableCell>
              <TableCell>{cat.sort_order}</TableCell>
              <TableCell className="space-x-1 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(cat)}
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShelvesParent(cat)}
                  aria-label={`Manage subcategories of ${cat.name}`}
                >
                  <FolderTree className="h-4 w-4" />
                  {cat.child_count > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-kraft-citrus px-1 text-[10px] font-semibold text-kraft-ink">
                      {cat.child_count}
                    </span>
                  ) : null}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => setPendingDelete(cat)}
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
      />

      <SubcategoriesSheet
        open={shelvesParent !== null}
        onOpenChange={(next) => {
          if (!next) setShelvesParent(null);
        }}
        parent={shelvesParent}
        allCategories={allCategories}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
        title="Delete category?"
        description={
          pendingDelete
            ? `Delete “${pendingDelete.name}”? Subcategories under it should be removed first if the store still references them.`
            : undefined
        }
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
