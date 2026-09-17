"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
} from "@/components/admin/AdminFormShell";
import { createBanner, updateBanner } from "@/lib/actions/banners";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";
import type { Banner } from "@/types/database";

export function BannerForm({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(banner?.image_url ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = Boolean(banner);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("image_url", imageUrl);

    startTransition(async () => {
      const result = isEdit
        ? await updateBanner(banner!.id, formData)
        : await createBanner(formData);
      if (result.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        if (!imageUrl) flat.image_url = flat.image_url ?? "Image is required";
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save banner");
      } else {
        setErrors({});
        toast.success(isEdit ? "Banner updated" : "Banner created");
        router.push("/admin/banners");
      }
    });
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection title="Copy">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={banner?.title}
                aria-invalid={!!errors.title}
              />
              <FieldError message={errors.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={banner?.subtitle ?? ""}
                aria-invalid={!!errors.subtitle}
              />
              <FieldError message={errors.subtitle} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL</Label>
              <Input
                id="link_url"
                name="link_url"
                defaultValue={banner?.link_url ?? ""}
                aria-invalid={!!errors.link_url}
              />
              <FieldError message={errors.link_url} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={banner?.sort_order ?? 0}
                aria-invalid={!!errors.sort_order}
              />
              <FieldError message={errors.sort_order} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Image"
          description="Required. Upload or paste a wide hero image."
        >
          <ImageUploader
            type="category"
            value={imageUrl ? [imageUrl] : []}
            onChange={(urls) => setImageUrl(urls[0] ?? "")}
          />
          <FieldError message={errors.image_url} />
        </AdminFormSection>

        <input
          type="hidden"
          name="is_active"
          value={banner?.is_active === false ? "false" : "true"}
        />

        <AdminFormActions>
          <Button
            type="submit"
            disabled={isPending || !imageUrl}
            className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
          >
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
