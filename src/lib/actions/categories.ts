"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requirePermission, requireAnyPermission } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validators/schemas";
import type { Category } from "@/types/database";

export async function createCategory(formData: FormData) {
  const { supabase } = await requirePermission("categories.manage");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    image_url: formData.get("image_url") || undefined,
    parent_id: formData.get("parent_id") || undefined,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("categories").insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const { supabase } = await requirePermission("categories.manage");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    image_url: formData.get("image_url") || undefined,
    parent_id: formData.get("parent_id") || undefined,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function softDeleteCategory(id: string) {
  const { supabase } = await requirePermission("categories.manage");

  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function uploadCategoryImage(formData: FormData) {
  const { supabase, user } = await requirePermission("categories.manage");
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${user.id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("category-images")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("category-images").getPublicUrl(path);

  return { url: publicUrl };
}

export async function getAdminCategories() {
  await requireAnyPermission(
    "categories.view",
    "products.view",
    "products.manage",
  );
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order")
    .order("name");
  return (data ?? []) as Category[];
}

export type CategoryListFilters = {
  q?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  pageSize?: number;
};

export async function listAdminCategories(filters: CategoryListFilters = {}) {
  await requirePermission("categories.view");
  const supabase = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("sort_order")
    .order("name");

  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,slug.ilike.%${filters.q}%`);
  }
  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as Category[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getAdminCategory(id: string): Promise<Category | null> {
  await requirePermission("categories.view");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  return data as Category | null;
}
