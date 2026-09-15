"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission, logAdminAction } from "@/lib/auth/session";
import { saleCampaignSchema } from "@/lib/validators/schemas";
import type { SaleCampaign, SaleCampaignType } from "@/types/database";

export type SaleListFilters = {
  q?: string;
  status?: "all" | "active" | "inactive";
  sale_type?: SaleCampaignType | "all";
  page?: number;
  pageSize?: number;
};

export async function getAdminSales(filters: SaleListFilters = {}) {
  await requirePermission("sales.view");
  const supabase = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("sale_campaigns")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,slug.ilike.%${filters.q}%`);
  }
  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);
  if (filters.sale_type && filters.sale_type !== "all") {
    query = query.eq("sale_type", filters.sale_type);
  }

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as SaleCampaign[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getAdminSale(id: string) {
  await requirePermission("sales.view");
  const supabase = await createServiceClient();
  const { data: campaign } = await supabase
    .from("sale_campaigns")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!campaign) return null;

  const { data: links } = await supabase
    .from("sale_campaign_products")
    .select("product_id, campaign_sale_price")
    .eq("campaign_id", id);

  return {
    ...(campaign as SaleCampaign),
    product_ids: (links ?? []).map((l) => l.product_id),
    product_prices: Object.fromEntries(
      (links ?? []).map((l) => [l.product_id, l.campaign_sale_price]),
    ) as Record<string, number | null>,
  };
}

function parseCampaignForm(formData: FormData) {
  const productIds = formData.getAll("product_ids").map(String).filter(Boolean);
  return saleCampaignSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sale_type: formData.get("sale_type") || "custom",
    description: formData.get("description") || undefined,
    starts_at: formData.get("starts_at") || null,
    ends_at: formData.get("ends_at") || null,
    is_active:
      formData.get("is_active") === "on" ||
      formData.get("is_active") === "true",
    product_ids: productIds,
  });
}

async function syncCampaignProducts(
  campaignId: string,
  productIds: string[],
  formData: FormData,
) {
  const supabase = await createServiceClient();
  await supabase
    .from("sale_campaign_products")
    .delete()
    .eq("campaign_id", campaignId);

  if (productIds.length === 0) return;

  const rows = productIds.map((productId) => {
    const raw = formData.get(`price_${productId}`);
    const price =
      raw !== null && String(raw).trim() !== ""
        ? Number(raw)
        : null;
    return {
      campaign_id: campaignId,
      product_id: productId,
      campaign_sale_price:
        price !== null && Number.isFinite(price) ? price : null,
    };
  });

  await supabase.from("sale_campaign_products").insert(rows);
}

export async function createSaleCampaign(formData: FormData) {
  const { supabase, session } = await requirePermission("sales.manage");
  const parsed = parseCampaignForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { product_ids, ...payload } = parsed.data;
  const starts_at = payload.starts_at
    ? new Date(payload.starts_at).toISOString()
    : null;
  const ends_at = payload.ends_at
    ? new Date(payload.ends_at).toISOString()
    : null;

  const { data, error } = await supabase
    .from("sale_campaigns")
    .insert({
      name: payload.name,
      slug: payload.slug,
      sale_type: payload.sale_type,
      description: payload.description || null,
      is_active: payload.is_active,
      starts_at,
      ends_at,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: { _form: [error?.message ?? "Failed to create sale"] } };
  }

  await syncCampaignProducts(data.id, product_ids, formData);
  await logAdminAction(session.user.id, "sale.create", "sale_campaign", data.id);
  revalidatePath("/admin/sales");
  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function updateSaleCampaign(id: string, formData: FormData) {
  const { supabase, session } = await requirePermission("sales.manage");
  const parsed = parseCampaignForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { product_ids, ...payload } = parsed.data;
  const starts_at = payload.starts_at
    ? new Date(payload.starts_at).toISOString()
    : null;
  const ends_at = payload.ends_at
    ? new Date(payload.ends_at).toISOString()
    : null;

  const { error } = await supabase
    .from("sale_campaigns")
    .update({
      name: payload.name,
      slug: payload.slug,
      sale_type: payload.sale_type,
      description: payload.description || null,
      is_active: payload.is_active,
      starts_at,
      ends_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: { _form: [error.message] } };

  await syncCampaignProducts(id, product_ids, formData);
  await logAdminAction(session.user.id, "sale.update", "sale_campaign", id);
  revalidatePath("/admin/sales");
  revalidatePath(`/admin/sales/${id}/edit`);
  revalidatePath("/");
  revalidatePath(`/sale/${payload.slug}`);
  return { success: true };
}

export async function softDeleteSaleCampaign(id: string) {
  const { supabase, session } = await requirePermission("sales.manage");
  await supabase
    .from("sale_campaigns")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAdminAction(session.user.id, "sale.delete", "sale_campaign", id);
  revalidatePath("/admin/sales");
  revalidatePath("/");
  return { success: true };
}
