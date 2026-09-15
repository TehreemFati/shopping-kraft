"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission, logAdminAction } from "@/lib/auth/session";
import { bannerSchema } from "@/lib/validators/schemas";
import type { Banner } from "@/types/database";

export type BannerListFilters = {
  q?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  pageSize?: number;
};

export async function getAdminBanners(filters: BannerListFilters = {}) {
  await requirePermission("banners.view");
  const supabase = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("banners")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,subtitle.ilike.%${filters.q}%`,
    );
  }
  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as Banner[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getAdminBanner(id: string): Promise<Banner | null> {
  await requirePermission("banners.view");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data as Banner | null;
}

export async function createBanner(formData: FormData) {
  const { supabase, session } = await requirePermission("banners.manage");

  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    image_url: formData.get("image_url"),
    link_url: formData.get("link_url") || undefined,
    sort_order: formData.get("sort_order") || 0,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("banners").insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };

  await logAdminAction(session.user.id, "banner.create", "banner");
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}

export async function updateBanner(id: string, formData: FormData) {
  const { supabase, session } = await requirePermission("banners.manage");

  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    image_url: formData.get("image_url"),
    link_url: formData.get("link_url") || undefined,
    sort_order: formData.get("sort_order") || 0,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("banners").update(parsed.data).eq("id", id);
  if (error) return { error: { _form: [error.message] } };

  await logAdminAction(session.user.id, "banner.update", "banner", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}

export async function softDeleteBanner(id: string) {
  const { supabase, session } = await requirePermission("banners.manage");
  await supabase
    .from("banners")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);

  await logAdminAction(session.user.id, "banner.delete", "banner", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}
