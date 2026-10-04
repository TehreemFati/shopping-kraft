"use client";

import { createClient } from "@/lib/supabase/client";

export type ImageUploadKind = "product" | "category";

/**
 * Upload an image from the browser directly to Supabase Storage.
 * Avoids Server Action body-size limits and keeps the preview snappy.
 */
export async function uploadImageToStorage(
  kind: ImageUploadKind,
  file: File,
  options?: { productId?: string },
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to upload images" };

  const bucket = kind === "product" ? "product-images" : "category-images";
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const folder =
    kind === "product" ? (options?.productId?.trim() || "temp") : null;
  const path = folder
    ? `${folder}/${Date.now()}-${user.id}.${ext}`
    : `${Date.now()}-${user.id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || `image/${ext}`,
      cacheControl: "3600",
    });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  if (!publicUrl) return { error: "Upload succeeded but no public URL returned" };
  return { url: publicUrl };
}
