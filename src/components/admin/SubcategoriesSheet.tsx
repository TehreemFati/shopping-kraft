"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { softDeleteCategory } from "@/lib/actions/categories";
import type { Category } from "@/types/database";

type SubcategoriesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent: Category | null;
  /** Full category list used to derive children of `parent`. */
  allCategories: Category[];
};

export function SubcategoriesSheet({
  open,
  onOpenChange,
  parent,
  allCategories,
}: SubcategoriesSheetProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { isPending, requestDelete, dialogProps } = useConfirmDelete({
    onDelete: softDeleteCategory,
    successMessage: "Subcategory deleted",
    title: "Delete subcategory?",
    descriptionTemplate:
      "Delete “{label}”? It will be removed from this aisle.",
  });

  const children = useMemo(() => {
    if (!parent) return [];
    return allCategories
      .filter((c) => c.parent_id === parent.id)
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.name.localeCompare(b.name),
      );
  }, [allCategories, parent]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setFormOpen(true);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-kraft-ink/10 bg-kraft-mist/50 px-5 py-5 text-left">
            <SheetTitle className="font-display text-xl text-kraft-ink">
              {parent ? `Shelves in ${parent.name}` : "Subcategories"}
            </SheetTitle>
            <SheetDescription>
              Add, edit, or remove subcategories for this aisle. Parent is
              fixed.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <Button
              type="button"
              variant="kraft"
              className="w-full"
              onClick={openCreate}
              disabled={!parent}
            >
              <Plus className="mr-2 size-4" />
              Add subcategory
            </Button>

            {children.length === 0 ? (
              <div className="rounded-xl border border-dashed border-kraft-ink/15 bg-kraft-mist/30 px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No shelves yet. Add the first subcategory for this aisle.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={openCreate}
                  disabled={!parent}
                >
                  Add first subcategory
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {children.map((child) => (
                  <li
                    key={child.id}
                    className="flex items-center gap-3 rounded-xl border border-kraft-ink/10 bg-card/80 p-3"
                  >
                    {child.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={child.image_url}
                        alt=""
                        className="size-11 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-kraft-mist text-[10px] text-muted-foreground">
                        —
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-kraft-ink">
                        {child.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {child.slug}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(child)}
                      aria-label={`Edit ${child.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => requestDelete(child.id, child.name)}
                      aria-label={`Delete ${child.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CategoryDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        parentId={parent?.id ?? null}
        parentName={parent?.name}
      />

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
