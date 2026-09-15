"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission, logAdminAction } from "@/lib/auth/session";
import type { Review } from "@/types/database";

export type AdminReview = Review & {
  products: { name: string; slug: string } | null;
  profiles: { full_name: string | null } | null;
};

export type ReviewListFilters = {
  q?: string;
  status?: "all" | "approved" | "pending";
  rating?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminReviews(filters: ReviewListFilters = {}) {
  await requirePermission("reviews.view");
  const supabase = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("reviews")
    .select("*, products(name, slug), profiles(full_name)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.status === "approved") query = query.eq("is_approved", true);
  if (filters.status === "pending") query = query.eq("is_approved", false);
  if (filters.rating && filters.rating !== "all") {
    const rating = Number(filters.rating);
    if (rating >= 1 && rating <= 5) query = query.eq("rating", rating);
  }

  const { data, count } = await query.range(from, to);
  let rows = (data ?? []) as AdminReview[];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    // Re-query all matching status then filter by product/customer name
    const { data: all } = await supabase
      .from("reviews")
      .select("*, products(name, slug), profiles(full_name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    rows = ((all ?? []) as AdminReview[]).filter((r) => {
      if (filters.status === "approved" && !r.is_approved) return false;
      if (filters.status === "pending" && r.is_approved) return false;
      if (filters.rating && filters.rating !== "all") {
        if (r.rating !== Number(filters.rating)) return false;
      }
      return (
        r.products?.name?.toLowerCase().includes(q) ||
        r.profiles?.full_name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      );
    });
    const total = rows.length;
    return {
      data: rows.slice(from, to + 1),
      total,
      page,
      pageSize,
      totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
    };
  }

  const total = count ?? 0;
  return {
    data: rows,
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function setReviewApproved(id: string, isApproved: boolean) {
  const { supabase, session } = await requirePermission("reviews.manage");
  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: isApproved })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction(session.user.id, "review.moderate", "review", id, {
    isApproved,
  });

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function softDeleteReview(id: string) {
  const { supabase, session } = await requirePermission("reviews.manage");
  const { error } = await supabase
    .from("reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction(session.user.id, "review.delete", "review", id);
  revalidatePath("/admin/reviews");
  return { success: true };
}
