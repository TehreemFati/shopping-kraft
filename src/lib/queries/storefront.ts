import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithImages } from "@/types/database";

export async function getVisibleCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order")
    .order("name");

  if (!categories?.length) return [];

  const { data: products } = await supabase
    .from("products")
    .select("category_id")
    .eq("is_active", true)
    .is("deleted_at", null);

  const categoryIdsWithProducts = new Set(
    products?.map((p) => p.category_id) ?? [],
  );

  return categories.filter((c) => categoryIdsWithProducts.has(c.id));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();
  return data as Category | null;
}

export async function getProductsByCategory(categoryId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), inventory(*)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProductWithImages[];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*), inventory(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();
  return data as ProductWithImages | null;
}

export async function getFeaturedProducts(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*), inventory(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .is("deleted_at", null)
    .limit(limit)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProductWithImages[];
}

export async function getActiveBanners() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getLatestProducts(limit = 12) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*), inventory(*)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ProductWithImages[];
}

export async function getTopSellerProducts(limit = 12) {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity");

  const counts = new Map<string, number>();
  for (const row of items ?? []) {
    if (!row.product_id) continue;
    counts.set(
      row.product_id,
      (counts.get(row.product_id) ?? 0) + Number(row.quantity ?? 0),
    );
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (ranked.length === 0) {
    const onSale = await supabase
      .from("products")
      .select("*, product_images(*), categories(*), inventory(*)")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    const rows = (onSale.data ?? []) as ProductWithImages[];
    const discounted = rows.filter(
      (p) => p.sale_price !== null && p.sale_price < p.price,
    );
    if (discounted.length > 0) return discounted;
    return getLatestProducts(limit);
  }

  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*), inventory(*)")
    .in("id", ranked)
    .eq("is_active", true)
    .is("deleted_at", null);

  const products = (data ?? []) as ProductWithImages[];
  const byId = new Map(products.map((p) => [p.id, p]));
  return ranked
    .map((id) => byId.get(id))
    .filter((p): p is ProductWithImages => Boolean(p));
}

export async function getNavCategories(limit = 6): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order")
    .order("name")
    .limit(limit);
  return (data ?? []) as Category[];
}

export async function getAllProducts(
  page = 1,
  limit = 12,
  options: {
    featured?: boolean;
    onSale?: boolean;
    sort?: "newest" | "price_asc" | "price_desc";
  } = {},
) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*, product_images(*), categories(*), inventory(*)", {
      count: "exact",
    })
    .eq("is_active", true)
    .is("deleted_at", null);

  if (options.featured) query = query.eq("is_featured", true);

  if (options.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (options.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  let products = (data ?? []) as ProductWithImages[];
  let total = count ?? 0;

  if (options.onSale) {
    const { data: all } = await supabase
      .from("products")
      .select("*, product_images(*), categories(*), inventory(*)")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    products = ((all ?? []) as ProductWithImages[]).filter(
      (p) => p.sale_price !== null && p.sale_price < p.price,
    );
    total = products.length;
    products = products.slice(from, to + 1);
  }

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export async function getOnSaleProducts(limit = 12) {
  const { products } = await getAllProducts(1, limit, { onSale: true });
  return products;
}

export async function getActiveSaleCampaigns() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("sale_campaigns")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as import("@/types/database").SaleCampaign[];
  return rows.filter((c) => {
    if (c.starts_at && c.starts_at > now) return false;
    if (c.ends_at && c.ends_at < now) return false;
    return true;
  });
}

export async function getSaleCampaignBySlug(slug: string) {
  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("sale_campaigns")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!campaign) return null;

  const now = new Date().toISOString();
  const c = campaign as import("@/types/database").SaleCampaign;
  if (c.starts_at && c.starts_at > now) return null;
  if (c.ends_at && c.ends_at < now) return null;

  const { data: links } = await supabase
    .from("sale_campaign_products")
    .select("product_id, campaign_sale_price")
    .eq("campaign_id", c.id);

  const productIds = (links ?? []).map((l) => l.product_id);
  if (productIds.length === 0) {
    return { campaign: c, products: [] as ProductWithImages[], prices: {} as Record<string, number | null> };
  }

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*), inventory(*)")
    .in("id", productIds)
    .eq("is_active", true)
    .is("deleted_at", null);

  const prices = Object.fromEntries(
    (links ?? []).map((l) => [l.product_id, l.campaign_sale_price]),
  ) as Record<string, number | null>;

  return {
    campaign: c,
    products: (products ?? []) as ProductWithImages[],
    prices,
  };
}

export async function searchProducts(query: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*), inventory(*)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(24);
  return (data ?? []) as ProductWithImages[];
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();
  if (!data) return fallback;
  return data.value as T;
}

export async function getAllSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*");
  const settings: Record<string, unknown> = {};
  data?.forEach((s) => {
    settings[s.key] = s.value;
  });
  return settings;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

export async function getCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return sessionId;
}
