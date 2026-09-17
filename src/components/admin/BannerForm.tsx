"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
  FieldLabel,
} from "@/components/admin/AdminFormShell";
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit";
import { createBanner, updateBanner } from "@/lib/actions/banners";
import type { Banner } from "@/types/database";

export function BannerForm({ banner }: { banner?: Banner }) {
  const [imageUrl, setImageUrl] = useState(banner?.image_url ?? "");
  const isEdit = Boolean(banner);

  const { errors, setErrors, isPending, onSubmit } = useAdminFormSubmit({
    action: (formData) =>
      isEdit ? updateBanner(banner!.id, formData) : createBanner(formData),
    successMessage: isEdit ? "Banner updated" : "Banner created",
    redirectTo: "/admin/banners",
    failureFallback: "Failed to save banner",
    prepareFormData: (formData) => {
      formData.set("image_url", imageUrl);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = String(new FormData(form).get("title") ?? "").trim();
    const next: Record<string, string> = {};
    if (!title) next.title = "Title is required";
    if (!imageUrl) next.image_url = "Image is required";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSubmit(e);
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <AdminFormSection title="Copy">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="title" required>
                Title
              </FieldLabel>
              <Input
                id="title"
                name="title"
                defaultValue={banner?.title}
                aria-invalid={!!errors.title}
                aria-required
              />
              <FieldError message={errors.title} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="subtitle">Subtitle</FieldLabel>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={banner?.subtitle ?? ""}
                aria-invalid={!!errors.subtitle}
              />
              <FieldError message={errors.subtitle} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="link_url">Link URL</FieldLabel>
              <Input
                id="link_url"
                name="link_url"
                defaultValue={banner?.link_url ?? ""}
                aria-invalid={!!errors.link_url}
              />
              <FieldError message={errors.link_url} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="sort_order">Sort order</FieldLabel>
              <NumericInput
                id="sort_order"
                name="sort_order"
                decimal={false}
                defaultValue={banner?.sort_order ?? 0}
                aria-invalid={!!errors.sort_order}
              />
              <FieldError message={errors.sort_order} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Image"
          description="Upload or paste a wide hero image."
        >
          <FieldLabel required>Image</FieldLabel>
          <ImageUploader
            type="category"
            value={imageUrl ? [imageUrl] : []}
            onChange={(urls) => {
              setImageUrl(urls[0] ?? "");
              if (urls[0]) {
                setErrors((prev) => {
                  const { image_url: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
          />
          <FieldError message={errors.image_url} />
        </AdminFormSection>

        <input
          type="hidden"
          name="is_active"
          value={banner?.is_active === false ? "false" : "true"}
        />

        <AdminFormActions>
          <Button type="submit" disabled={isPending} variant="kraft">
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create banner"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/banners">Cancel</Link>
          </Button>
        </AdminFormActions>
      </form>
    </AdminFormShell>
  );
}
