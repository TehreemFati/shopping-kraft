"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { couponSchema } from "@/lib/validators/schemas";
import type { Coupon } from "@/types/database";

export async function validateCouponCode(code: string, subtotal: number) {
  const supabase = await createServiceClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!coupon) return { error: "Invalid coupon code" };

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { error: "Coupon has expired" };
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { error: "Coupon usage limit reached" };
  }

  if (coupon.min_order && subtotal < coupon.min_order) {
    return { error: `Minimum order of PKR ${coupon.min_order} required` };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, subtotal);

  return { discount, couponId: coupon.id, code: coupon.code };
}

export async function createCoupon(formData: FormData) {
  const { supabase } = await requirePermission("coupons.manage");

  const parsed = couponSchema.safeParse({
    code: (formData.get("code") as string)?.toUpperCase(),
    type: formData.get("type"),
    value: formData.get("value"),
    min_order: formData.get("min_order") || undefined,
    max_uses: formData.get("max_uses") || null,
    expires_at: formData.get("expires_at") || null,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("coupons").insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, formData: FormData) {
  const { supabase } = await requirePermission("coupons.manage");

  const parsed = couponSchema.safeParse({
    code: (formData.get("code") as string)?.toUpperCase(),
    type: formData.get("type"),
    value: formData.get("value"),
    min_order: formData.get("min_order") || undefined,
    max_uses: formData.get("max_uses") || null,
    expires_at: formData.get("expires_at") || null,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("coupons").update(parsed.data).eq("id", id);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export type CouponListFilters = {
  q?: string;
  status?: "all" | "active" | "inactive";
  type?: "all" | "percentage" | "fixed";
  page?: number;
  pageSize?: number;
};

export async function getAdminCoupons(filters: CouponListFilters = {}) {
  await requirePermission("coupons.view");
  const supabase = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("coupons")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.q) query = query.ilike("code", `%${filters.q}%`);
  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);
  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as Coupon[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getAdminCoupon(id: string): Promise<Coupon | null> {
  await requirePermission("coupons.view");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data as Coupon | null;
}

export async function softDeleteCoupon(id: string) {
  const { supabase } = await requirePermission("coupons.manage");
  await supabase
    .from("coupons")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);
  revalidatePath("/admin/coupons");
  return { success: true };
}
