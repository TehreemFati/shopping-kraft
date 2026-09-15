"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { productSchema } from "@/lib/validators/schemas";
import type { AdminProduct } from "@/types/database";

export async function createProduct(formData: FormData) {
  const { supabase, user } = await requirePermission("products.manage");

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category_id: formData.get("category_id"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    sale_price: formData.get("sale_price") || null,
    sku: formData.get("sku") || undefined,
    stock: formData.get("stock") || 0,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
    is_featured: formData.get("is_featured") === "on" || formData.get("is_featured") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { stock, ...productData } = parsed.data;

  const { data: product, error } = await supabase
    .from("products")
    .insert(productData)
    .select("id")
    .single();

  if (error || !product) {
    return { error: { _form: [error?.message ?? "Failed to create product"] } };
  }

  await supabase.from("inventory").insert({
    product_id: product.id,
    quantity: stock,
  });

  const imageUrls = formData.getAll("image_urls") as string[];
  if (imageUrls.length > 0) {
    await supabase.from("product_images").insert(
      imageUrls.map((url, i) => ({
        product_id: product.id,
        url,
        sort_order: i,
        is_primary: i === 0,
      })),
    );
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const { supabase } = await requirePermission("products.manage");

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category_id: formData.get("category_id"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    sale_price: formData.get("sale_price") || null,
    sku: formData.get("sku") || undefined,
    stock: formData.get("stock") || 0,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
    is_featured: formData.get("is_featured") === "on" || formData.get("is_featured") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { stock, ...productData } = parsed.data;

  const { error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id);

  if (error) return { error: { _form: [error.message] } };

  const { data: existingInv } = await supabase
    .from("inventory")
    .select("id")
    .eq("product_id", id)
    .maybeSingle();

  if (existingInv) {
    await supabase.from("inventory").update({ quantity: stock }).eq("id", existingInv.id);
  } else {
    await supabase.from("inventory").insert({ product_id: id, quantity: stock });
  }

  const imageUrls = formData.getAll("image_urls") as string[];
  if (imageUrls.length > 0) {
    await supabase.from("product_images").delete().eq("product_id", id);
    await supabase.from("product_images").insert(
      imageUrls.map((url, i) => ({
        product_id: id,
        url,
        sort_order: i,
        is_primary: i === 0,
      })),
    );
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${productData.slug}`);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function softDeleteProduct(id: string) {
  const { supabase } = await requirePermission("products.manage");

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function uploadProductImage(formData: FormData) {
  const { supabase, user } = await requirePermission("products.manage");
  const file = formData.get("file") as File;
  const productId = formData.get("product_id") as string | null;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const folder = productId ?? "temp";
  const path = `${folder}/${Date.now()}-${user.id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);

  return { url: publicUrl };
}

export type ProductListFilters = {
  q?: string;
  status?: "all" | "active" | "inactive";
  featured?: "all" | "yes" | "no";
  page?: number;
  pageSize?: number;
};

export async function getAdminProducts(filters: ProductListFilters = {}) {
  await requirePermission("products.view");
  const supabase = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name), product_images(*), inventory(*)", {
      count: "exact",
    })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,sku.ilike.%${filters.q}%,slug.ilike.%${filters.q}%`,
    );
  }
  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);
  if (filters.featured === "yes") query = query.eq("is_featured", true);
  if (filters.featured === "no") query = query.eq("is_featured", false);

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as AdminProduct[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  await requirePermission("products.view");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), inventory(*)")
    .eq("id", id)
    .single();
  return data as AdminProduct | null;
}
