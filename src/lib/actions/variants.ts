"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission, logAdminAction } from "@/lib/auth/session";
import { variantSchema } from "@/lib/validators/schemas";
import type { ProductVariant } from "@/types/database";

export async function getProductVariants(productId: string) {
  await requirePermission("products.view");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .is("deleted_at", null)
    .order("created_at");
  return (data ?? []) as ProductVariant[];
}

export async function createVariant(productId: string, formData: FormData) {
  const { supabase, session } = await requirePermission("products.manage");

  const parsed = variantSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    price: formData.get("price") || null,
    sale_price: formData.get("sale_price") || null,
    stock: formData.get("stock") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { stock, ...variantData } = parsed.data;

  const { data: variant, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      ...variantData,
      stock,
      attributes: {},
    })
    .select("id")
    .single();

  if (error || !variant) {
    return { error: { _form: [error?.message ?? "Failed to create variant"] } };
  }

  await supabase.from("inventory").insert({
    variant_id: variant.id,
    quantity: stock,
  });

  await logAdminAction(session.user.id, "variant.create", "variant", variant.id);
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

export async function updateVariant(id: string, productId: string, formData: FormData) {
  const { supabase, session } = await requirePermission("products.manage");

  const parsed = variantSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    price: formData.get("price") || null,
    sale_price: formData.get("sale_price") || null,
    stock: formData.get("stock") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { stock, ...variantData } = parsed.data;

  const { error } = await supabase
    .from("product_variants")
    .update({ ...variantData, stock })
    .eq("id", id);

  if (error) return { error: { _form: [error.message] } };

  const { data: inv } = await supabase
    .from("inventory")
    .select("id")
    .eq("variant_id", id)
    .maybeSingle();

  if (inv) {
    await supabase.from("inventory").update({ quantity: stock }).eq("id", inv.id);
  } else {
    await supabase.from("inventory").insert({ variant_id: id, quantity: stock });
  }

  await logAdminAction(session.user.id, "variant.update", "variant", id);
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

export async function softDeleteVariant(id: string, productId: string) {
  const { supabase, session } = await requirePermission("products.manage");
  await supabase
    .from("product_variants")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  await logAdminAction(session.user.id, "variant.delete", "variant", id);
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}
