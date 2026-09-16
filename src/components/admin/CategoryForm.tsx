"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlugInput } from "@/components/admin/SlugInput";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  AdminFormShell,
  AdminFormSection,
  FieldError,
} from "@/components/admin/AdminFormShell";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";
import type { Category } from "@/types/database";

export function CategoryForm({
  category,
  parentOptions = [],
}: {
  category?: Category;
  /** Top-level categories only (for parent picker). */
  parentOptions?: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [parentId, setParentId] = useState(category?.parent_id ?? "");
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = Boolean(category);

  const selectableParents = parentOptions.filter(
    (c) => c.id !== category?.id && !c.parent_id,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (imageUrl) formData.set("image_url", imageUrl);
    formData.set("parent_id", parentId);

    startTransition(async () => {
      const result = isEdit
        ? await updateCategory(category!.id, formData)
        : await createCategory(formData);
      if (result.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save category");
      } else {
        setErrors({});
        toast.success(isEdit ? "Category updated" : "Category created");
        router.push("/admin/categories");
      }
    });
  }

  return (
    <AdminFormShell
      title={isEdit ? "Edit category" : "Add category"}
      description="Organize the gift catalog into browsable aisles."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection title="Basics">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              required
            />
            <FieldError message={errors.name} />
          </div>
          <SlugInput
            name="slug"
            sourceValue={name}
            defaultValue={category?.slug}
          />
          <FieldError message={errors.slug} />
          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent category</Label>
            <select
              id="parent_id"
              name="parent_id"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              aria-invalid={!!errors.parent_id}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">None (top-level)</option>
              {selectableParents.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Optional. Only one level of nesting is supported.
            </p>
            <FieldError message={errors.parent_id} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description ?? ""}
              aria-invalid={!!errors.description}
            />
            <FieldError message={errors.description} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={category?.sort_order ?? 0}
              aria-invalid={!!errors.sort_order}
            />
            <FieldError message={errors.sort_order} />
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Image"
          description="Optional cover photo for storefront sliders (works for both categories and subcategories)."
        >
          <ImageUploader
            type="category"
            value={imageUrl ? [imageUrl] : []}
            onChange={(urls) => setImageUrl(urls[0] ?? "")}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Leave empty to show a styled gradient placeholder on the homepage.
          </p>
        </AdminFormSection>

        <input
          type="hidden"
          name="is_active"
          value={category?.is_active === false ? "false" : "true"}
        />

        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
          >
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create Category"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/categories">Cancel</Link>
          </Button>
        </div>
      </form>
    </AdminFormShell>
  );
}
