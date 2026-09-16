"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requirePermission, logAdminAction } from "@/lib/auth/session";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { checkoutSchema } from "@/lib/validators/schemas";
import { getCartItems, clearCart } from "@/lib/actions/cart";
import { validateCouponCode } from "@/lib/actions/coupons";
import { generateOrderNumber } from "@/lib/utils/format";
import type {
  OrderStatus,
  PaymentStatus,
  OrderWithItems,
  AdminOrder,
  LowStockItem,
} from "@/types/database";

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (isAdminOrStaff(profile?.role)) {
      return {
        error: { _form: ["Admin accounts cannot place shop orders"] },
      };
    }
  }

  const parsed = checkoutSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    province: formData.get("province"),
    postal_code: formData.get("postal_code") || undefined,
    payment_method: formData.get("payment_method"),
    coupon_code: formData.get("coupon_code") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const items = await getCartItems();
  if (!items.length) return { error: { _form: ["Your cart is empty"] } };

  const serviceClient = await createServiceClient();

  const { data: shippingSetting } = await serviceClient
    .from("settings")
    .select("value")
    .eq("key", "shipping_flat_rate")
    .single();

  const shipping = Number(shippingSetting?.value ?? 200);
  let subtotal = 0;
  let discount = 0;
  let couponId: string | null = null;

  for (const item of items) {
    const stock = item.products?.inventory?.[0]?.quantity ?? 0;
    if (stock < item.quantity) {
      return { error: { _form: [`Insufficient stock for ${item.products.name}`] } };
    }
    subtotal += item.unit_price * item.quantity;
  }

  if (parsed.data.coupon_code) {
    const couponResult = await validateCouponCode(parsed.data.coupon_code, subtotal);
    if (couponResult.error) {
      return { error: { coupon_code: [couponResult.error] } };
    }
    discount = couponResult.discount ?? 0;
    couponId = couponResult.couponId ?? null;
  }

  const total = Math.max(0, subtotal - discount + shipping);

  const shippingAddress = {
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    line1: parsed.data.line1,
    line2: parsed.data.line2,
    city: parsed.data.city,
    province: parsed.data.province,
    postal_code: parsed.data.postal_code,
    country: "PK",
  };

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await serviceClient
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user?.id ?? null,
      status: "pending",
      subtotal,
      discount,
      shipping,
      total,
      payment_status: "pending",
      payment_method: parsed.data.payment_method,
      shipping_address: shippingAddress,
      coupon_id: couponId,
      notes: parsed.data.notes,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { error: { _form: [orderError?.message ?? "Failed to create order"] } };
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.products.name,
    sku: item.products.sku,
    unit_price: item.unit_price,
    quantity: item.quantity,
    total_price: item.unit_price * item.quantity,
  }));

  await serviceClient.from("order_items").insert(orderItems);

  await serviceClient.from("payments").insert({
    order_id: order.id,
    provider: parsed.data.payment_method,
    amount: total,
    status: "pending",
  });

  for (const item of items) {
    const inv = item.products?.inventory?.[0];
    if (inv) {
      const newQty = inv.quantity - item.quantity;
      await serviceClient
        .from("inventory")
        .update({ quantity: newQty })
        .eq("id", inv.id);

      await serviceClient.from("inventory_movements").insert({
        inventory_id: inv.id,
        change_qty: -item.quantity,
        reason: "order",
        reference_type: "order",
        reference_id: order.id,
        created_by: user?.id ?? null,
      });
    }
  }

  if (couponId) {
    const { data: coupon } = await serviceClient
      .from("coupons")
      .select("used_count")
      .eq("id", couponId)
      .single();
    if (coupon) {
      await serviceClient
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("id", couponId);
    }

    await serviceClient.from("coupon_usage").insert({
      coupon_id: couponId,
      user_id: user?.id ?? null,
      order_id: order.id,
    });
  }

  if (user) {
    const { data: cart } = await serviceClient
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (cart) await clearCart(cart.id);
  } else {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;
    if (sessionId) {
      const { data: guestCart } = await serviceClient
        .from("carts")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (guestCart) await clearCart(guestCart.id);
    }
  }

  revalidatePath("/cart");
  revalidatePath("/admin/orders");

  const methodLabel =
    parsed.data.payment_method === "jazzcash"
      ? "JazzCash"
      : parsed.data.payment_method === "easypaisa"
        ? "EasyPaisa"
        : "Bank Transfer";

  const itemLines = items
    .map((item) => `• ${item.products.name} × ${item.quantity}`)
    .join("\n");

  const waText = [
    "🛍️ *New Shopping Kraft Order*",
    "",
    `Order: *${order.order_number}*`,
    `Payment: ${methodLabel} (prepaid)`,
    `Total: Rs ${total.toLocaleString("en-PK")}`,
    "",
    `Name: ${parsed.data.full_name}`,
    `Phone: ${parsed.data.phone}`,
    `Address: ${parsed.data.line1}${parsed.data.line2 ? `, ${parsed.data.line2}` : ""}, ${parsed.data.city}, ${parsed.data.province}`,
    "",
    "Items:",
    itemLines,
    parsed.data.notes ? `\nNotes: ${parsed.data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappUrl = `https://wa.me/923135009138?text=${encodeURIComponent(waText)}`;

  return {
    success: true,
    orderNumber: order.order_number,
    orderId: order.id,
    whatsappUrl,
  };
}

async function restoreOrderStock(orderId: string, actorId: string) {
  const service = await createServiceClient();
  const { data: items } = await service
    .from("order_items")
    .select("product_id, variant_id, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    let invQuery = service.from("inventory").select("id, quantity");
    if (item.variant_id) {
      invQuery = invQuery.eq("variant_id", item.variant_id);
    } else if (item.product_id) {
      invQuery = invQuery.eq("product_id", item.product_id).is("variant_id", null);
    } else {
      continue;
    }

    const { data: inv } = await invQuery.maybeSingle();
    if (!inv) continue;

    const newQty = inv.quantity + item.quantity;
    await service.from("inventory").update({ quantity: newQty }).eq("id", inv.id);
    await service.from("inventory_movements").insert({
      inventory_id: inv.id,
      change_qty: item.quantity,
      reason: "order_cancel",
      reference_type: "order",
      reference_id: orderId,
      created_by: actorId,
    });
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { supabase, session } = await requirePermission("orders.manage");

  const { data: existing } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!existing) return { error: "Order not found" };

  const updates: {
    status: OrderStatus;
    payment_status?: PaymentStatus;
  } = { status };

  if (status === "confirmed") updates.payment_status = "paid";

  const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
  if (error) return { error: error.message };

  if (status === "cancelled" && existing.status !== "cancelled") {
    await restoreOrderStock(orderId, session.user.id);
  }

  if (status === "confirmed") {
    const service = await createServiceClient();
    await service
      .from("payments")
      .update({ status: "paid" })
      .eq("order_id", orderId)
      .eq("status", "pending");
  }

  await logAdminAction(session.user.id, "order.status", "order", orderId, {
    status,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updateTrackingNumber(orderId: string, trackingNumber: string) {
  const { supabase, session } = await requirePermission("orders.manage");
  const { error } = await supabase
    .from("orders")
    .update({ tracking_number: trackingNumber || null })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await logAdminAction(session.user.id, "order.tracking", "order", orderId, {
    trackingNumber,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function refundOrder(orderId: string) {
  const { supabase, session } = await requirePermission("orders.manage");

  const { data: order } = await supabase
    .from("orders")
    .select("status, payment_status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found" };

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "refunded",
      status: order.status === "cancelled" ? "cancelled" : "cancelled",
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  if (order.status !== "cancelled") {
    await restoreOrderStock(orderId, session.user.id);
  }

  const service = await createServiceClient();
  await service
    .from("payments")
    .update({ status: "refunded" })
    .eq("order_id", orderId);

  await logAdminAction(session.user.id, "order.refund", "order", orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export type OrderListFilters = {
  q?: string;
  status?: OrderStatus | "all";
  payment_status?: PaymentStatus | "all";
  page?: number;
  pageSize?: number;
};

export async function getAdminOrders(filters: OrderListFilters | OrderStatus = {}) {
  await requirePermission("orders.view");
  const supabase = await createServiceClient();

  const normalized: OrderListFilters =
    typeof filters === "string" ? { status: filters } : filters;

  const page = normalized.page ?? 1;
  const pageSize = normalized.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select("*, order_items(*), profiles(full_name, phone)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (normalized.status && normalized.status !== "all") {
    query = query.eq("status", normalized.status);
  }
  if (normalized.payment_status && normalized.payment_status !== "all") {
    query = query.eq("payment_status", normalized.payment_status);
  }
  if (normalized.q) {
    query = query.ilike("order_number", `%${normalized.q}%`);
  }

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as AdminOrder[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  await requirePermission("orders.view");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(full_name, phone), payments(*)")
    .eq("id", id)
    .single();
  return data as AdminOrder | null;
}

export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as OrderWithItems[];
}

export async function getDashboardStats() {
  await requirePermission("dashboard.view");
  const supabase = await createServiceClient();

  const [orders, products, lowStock] = await Promise.all([
    supabase.from("orders").select("status"),
    supabase.from("products").select("id").is("deleted_at", null),
    supabase.from("inventory").select("*, products(name)").lte("quantity", 5),
  ]);

  const statusCounts: Record<string, number> = {};
  orders.data?.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  });

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    statusCounts,
    productCount: products.data?.length ?? 0,
    lowStock: (lowStock.data ?? []) as LowStockItem[],
    recentOrders: (recentOrders ?? []) as AdminOrder[],
  };
}
