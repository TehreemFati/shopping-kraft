"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { getEffectivePrice } from "@/lib/utils/format";
import type { CartItemWithProduct, Product, Inventory, CartItem } from "@/types/database";

type ProductWithInventory = Product & { inventory: Inventory[] | null };
type CartItemWithInventory = CartItem & {
  products: { inventory: Inventory[] | null } | null;
};
type GuestCart = { id: string; cart_items: CartItem[] };

/** Read-only: safe during RSC render. Never sets cookies or creates carts. */
async function getExistingCart() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    return cart ? { supabase, cartId: cart.id } : null;
  }

  const sessionId = cookieStore.get("cart_session")?.value;
  if (!sessionId) return null;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  return cart ? { supabase, cartId: cart.id } : null;
}

/** Mutations only: may set cart_session cookie and create cart rows. */
async function getOrCreateCart() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cart) return { supabase, cartId: cart.id };

    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    return { supabase, cartId: newCart!.id };
  }

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

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (cart) return { supabase, cartId: cart.id };

  const { data: newCart } = await supabase
    .from("carts")
    .insert({ session_id: sessionId })
    .select("id")
    .single();

  return { supabase, cartId: newCart!.id };
}

export async function getCartItems(): Promise<CartItemWithProduct[]> {
  const existing = await getExistingCart();
  if (!existing) return [];

  const { data } = await existing.supabase
    .from("cart_items")
    .select("*, products(*, product_images(*), inventory(*))")
    .eq("cart_id", existing.cartId);

  return (data ?? []) as CartItemWithProduct[];
}

export async function getCartCount(): Promise<number> {
  const items = await getCartItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function addToCart(productId: string, quantity = 1) {
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (user) {
    const { data: profile } = await supabaseAuth
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (isAdminOrStaff(profile?.role)) {
      return { error: "Admin accounts cannot place shop orders" };
    }
  }

  const { supabase, cartId } = await getOrCreateCart();

  const { data: productData } = await supabase
    .from("products")
    .select("*, inventory(*)")
    .eq("id", productId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  const product = productData as ProductWithInventory | null;

  if (!product) return { error: "Product not found" };

  const stock = product.inventory?.[0]?.quantity ?? 0;
  if (stock < quantity) return { error: "Insufficient stock" };

  const unitPrice = getEffectivePrice(product.price, product.sale_price);

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > stock) return { error: "Insufficient stock" };
    await supabase
      .from("cart_items")
      .update({ quantity: newQty, unit_price: unitPrice })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const { supabase, cartId } = await getOrCreateCart();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId).eq("cart_id", cartId);
    revalidatePath("/cart");
    return { success: true };
  }

  const { data: itemData } = await supabase
    .from("cart_items")
    .select("*, products(inventory(*))")
    .eq("id", itemId)
    .eq("cart_id", cartId)
    .single();

  const item = itemData as CartItemWithInventory | null;

  if (!item) return { error: "Item not found" };

  const stock = item.products?.inventory?.[0]?.quantity ?? 0;
  if (quantity > stock) return { error: "Insufficient stock" };

  await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(itemId: string) {
  const { supabase, cartId } = await getOrCreateCart();
  await supabase.from("cart_items").delete().eq("id", itemId).eq("cart_id", cartId);
  revalidatePath("/cart");
  return { success: true };
}

export async function clearCart(cartId: string) {
  const supabase = await createServiceClient();
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
}

export async function mergeGuestCart(userId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session")?.value;
  if (!sessionId) return;

  const supabase = await createServiceClient();

  const { data: guestCartData } = await supabase
    .from("carts")
    .select("id, cart_items(*)")
    .eq("session_id", sessionId)
    .maybeSingle();

  const guestCart = guestCartData as GuestCart | null;

  if (!guestCart?.cart_items?.length) return;

  let { data: userCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!userCart) {
    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    userCart = newCart;
  }

  for (const item of guestCart.cart_items) {
    await supabase.from("cart_items").upsert(
      {
        cart_id: userCart!.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      },
      { onConflict: "cart_id,product_id,variant_id" },
    );
  }

  await supabase.from("cart_items").delete().eq("cart_id", guestCart.id);
  await supabase.from("carts").delete().eq("id", guestCart.id);
  cookieStore.delete("cart_session");
}
