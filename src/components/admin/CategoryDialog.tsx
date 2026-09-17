"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SlugInput } from "@/components/admin/SlugInput";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { NumericInput } from "@/components/ui/numeric-input";
import { FieldError, FieldLabel } from "@/components/admin/AdminFormShell";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";
import type { Category } from "@/types/database";

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  /** When set, creates/updates as a subcategory of this parent. */
  parentId?: string | null;
  parentName?: string;
};

export function CategoryDialog({
  open,
  onOpenChange,
  category = null,
  parentId = null,
  parentName,
}: CategoryDialogProps) {
  const isEdit = Boolean(category);
  const isSub = Boolean(parentId);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [showMore, setShowMore] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setImageUrl(category?.image_url ?? "");
    setDescription(category?.description ?? "");
    setSortOrder(String(category?.sort_order ?? 0));
    setShowMore(Boolean(category?.description || (category?.sort_order ?? 0) !== 0));
    setErrors({});
  }, [open, category]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const formData = new FormData(e.currentTarget);
    if (imageUrl) formData.set("image_url", imageUrl);
    else formData.delete("image_url");
    formData.set("parent_id", parentId ?? "");
    formData.set("is_active", "true");
    formData.set("sort_order", sortOrder);
    formData.set("description", description);

    startTransition(async () => {
      const result = isEdit
        ? await updateCategory(category!.id, formData)
        : await createCategory(formData);
      if (result.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save");
        return;
      }
      toast.success(
        isSub
          ? isEdit
            ? "Subcategory updated"
            : "Subcategory created"
          : isEdit
            ? "Category updated"
            : "Category created",
      );
      onOpenChange(false);
    });
  }

  const title = isSub
    ? isEdit
      ? "Edit subcategory"
      : "Add subcategory"
    : isEdit
      ? "Edit category"
      : "New category";

  const descriptionText = isSub
    ? parentName
      ? `Shelf under “${parentName}”.`
      : "Add a shelf under this aisle."
    : "Name, URL slug, and optional cover image.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden border-0 p-0 ring-1 ring-kraft-ink/10 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="border-b border-kraft-ink/10 bg-kraft-mist/50 px-5 py-4 sm:px-6">
          <DialogTitle className="font-display text-xl text-kraft-ink">
            {title}
          </DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>

        <form
          key={category?.id ?? `new-${parentId ?? "root"}`}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 px-5 py-5 sm:px-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <FieldLabel htmlFor="cat-name" required>
                Name
              </FieldLabel>
              <Input
                id="cat-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                aria-required
              />
              <FieldError message={errors.name} />
            </div>
            <div className="sm:col-span-1">
              <SlugInput
                name="slug"
                sourceValue={name}
                defaultValue={category?.slug}
                required
              />
              <FieldError message={errors.slug} />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Image</FieldLabel>
            <ImageUploader
              type="category"
              value={imageUrl ? [imageUrl] : []}
              onChange={(urls) => setImageUrl(urls[0] ?? "")}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Leave empty for a gradient placeholder on the storefront.
            </p>
            <FieldError message={errors.image_url} />
          </div>

          <button
            type="button"
            className="text-xs font-medium text-kraft-ink/60 underline-offset-2 hover:underline"
            onClick={() => setShowMore((v) => !v)}
          >
            {showMore ? "Hide extra fields" : "Description & sort order"}
          </button>

          {showMore ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel htmlFor="cat-description">Description</FieldLabel>
                <Textarea
                  id="cat-description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="cat-sort">Sort order</FieldLabel>
                <NumericInput
                  id="cat-sort"
                  name="sort_order"
                  decimal={false}
                  value={sortOrder}
                  onValueChange={setSortOrder}
                />
              </div>
            </div>
          ) : (
            <>
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="sort_order" value={sortOrder} />
            </>
          )}

          <FieldError message={errors._form} />

          <DialogFooter className="mx-0 mb-0 rounded-none border-t border-kraft-ink/10 bg-kraft-mist/30 px-0 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              variant="kraft"
            >
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
