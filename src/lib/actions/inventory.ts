"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import type { InventoryWithProduct, LowStockItem } from "@/types/database";

export async function adjustStock(
  inventoryId: string,
  newQuantity: number,
  reason: string,
) {
  const { supabase, user } = await requirePermission("inventory.manage");

  const { data: inv } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("id", inventoryId)
    .single();

  if (!inv) return { error: "Inventory not found" };

  const change = newQuantity - inv.quantity;

  const { error } = await supabase
    .from("inventory")
    .update({ quantity: newQuantity })
    .eq("id", inventoryId);

  if (error) return { error: error.message };

  await supabase.from("inventory_movements").insert({
    inventory_id: inventoryId,
    change_qty: change,
    reason,
    reference_type: "manual",
    created_by: user.id,
  });

  revalidatePath("/admin/inventory");
  return { success: true };
}

export type InventoryListFilters = {
  q?: string;
  stock?: "all" | "low" | "out" | "in";
  page?: number;
  pageSize?: number;
};

export async function getAdminInventory(filters: InventoryListFilters = {}) {
  await requirePermission("inventory.view");
  const supabase = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Product name search needs in-memory filter due to nested relation limits
  if (filters.q) {
    const { data: all } = await supabase
      .from("inventory")
      .select("*, products(name, sku), product_variants(name, sku)")
      .order("quantity");

    const q = filters.q.toLowerCase();
    let filtered = ((all ?? []) as InventoryWithProduct[]).filter(
      (item) =>
        item.products?.name?.toLowerCase().includes(q) ||
        item.products?.sku?.toLowerCase().includes(q) ||
        item.product_variants?.name?.toLowerCase().includes(q) ||
        item.product_variants?.sku?.toLowerCase().includes(q),
    );

    if (filters.stock === "low") {
      filtered = filtered.filter((i) => i.quantity > 0 && i.quantity <= 5);
    } else if (filters.stock === "out") {
      filtered = filtered.filter((i) => i.quantity === 0);
    } else if (filters.stock === "in") {
      filtered = filtered.filter((i) => i.quantity > 5);
    }

    const total = filtered.length;
    return {
      data: filtered.slice(from, to + 1),
      total,
      page,
      pageSize,
      totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
    };
  }

  let query = supabase
    .from("inventory")
    .select("*, products(name, sku), product_variants(name, sku)", {
      count: "exact",
    })
    .order("quantity");

  if (filters.stock === "low") query = query.gt("quantity", 0).lte("quantity", 5);
  if (filters.stock === "out") query = query.eq("quantity", 0);
  if (filters.stock === "in") query = query.gt("quantity", 5);

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as InventoryWithProduct[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getLowStock(threshold = 5): Promise<LowStockItem[]> {
  await requirePermission("inventory.view");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("inventory")
    .select("*, products(name, sku)")
    .lte("quantity", threshold);
  return (data ?? []) as LowStockItem[];
}
