"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requirePermission, requireAnyPermission } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validators/schemas";
import type { Category } from "@/types/database";

async function resolveParentId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parentId: string | undefined,
  selfId?: string,
) {
  if (!parentId) return { parent_id: null as string | null };

  if (selfId && parentId === selfId) {
    return { error: { parent_id: ["Category cannot be its own parent"] } };
  }

  const { data: parent } = await supabase
    .from("categories")
    .select("id, parent_id, deleted_at")
    .eq("id", parentId)
    .maybeSingle();

  if (!parent || parent.deleted_at) {
    return { error: { parent_id: ["Parent category not found"] } };
  }
  if (parent.parent_id) {
    return {
      error: {
        parent_id: ["Only top-level categories can be parents (one level)"],
      },
    };
  }

  if (selfId) {
    const { count } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", selfId)
      .is("deleted_at", null);
    if ((count ?? 0) > 0) {
      return {
        error: {
          parent_id: [
            "This category has subcategories — remove them before nesting it",
          ],
        },
      };
    }
  }

  return { parent_id: parentId };
}

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

  const parentResult = await resolveParentId(supabase, parsed.data.parent_id);
  if ("error" in parentResult && parentResult.error) {
    return { error: parentResult.error };
  }

  const { error } = await supabase.from("categories").insert({
    ...parsed.data,
    parent_id: parentResult.parent_id ?? null,
  });
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

  const parentResult = await resolveParentId(
    supabase,
    parsed.data.parent_id,
    id,
  );
  if ("error" in parentResult && parentResult.error) {
    return { error: parentResult.error };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      ...parsed.data,
      parent_id: parentResult.parent_id ?? null,
    })
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

export type AdminCategoryRow = Category & { child_count: number };

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
    .is("parent_id", null)
    .order("sort_order")
    .order("name");

  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,slug.ilike.%${filters.q}%`);
  }
  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);

  const { data, count } = await query.range(from, to);
  const roots = (data ?? []) as Category[];
  const total = count ?? 0;

  const childCountByParent = new Map<string, number>();
  if (roots.length > 0) {
    const { data: children } = await supabase
      .from("categories")
      .select("parent_id")
      .is("deleted_at", null)
      .in(
        "parent_id",
        roots.map((r) => r.id),
      );
    for (const row of children ?? []) {
      if (!row.parent_id) continue;
      childCountByParent.set(
        row.parent_id,
        (childCountByParent.get(row.parent_id) ?? 0) + 1,
      );
    }
  }

  return {
    data: roots.map((r) => ({
      ...r,
      child_count: childCountByParent.get(r.id) ?? 0,
    })) as AdminCategoryRow[],
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
