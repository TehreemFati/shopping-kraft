"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import type { AdminOrder, LowStockItem } from "@/types/database";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

export async function getAnalyticsDashboard() {
  await requirePermission("dashboard.view");
  const supabase = await createServiceClient();

  const since30 = daysAgo(30).toISOString();
  const since7 = daysAgo(7).toISOString();
  const since1 = daysAgo(0).toISOString();

  const [
    { data: orders30 },
    { data: products },
    customersRes,
    customers7Res,
    { data: lowStock },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, total, created_at, payment_status")
      .gte("created_at", since30),
    supabase
      .from("products")
      .select("id, is_active")
      .is("deleted_at", null),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .is("deleted_at", null),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .is("deleted_at", null)
      .gte("created_at", since7),
    supabase.from("inventory").select("*, products(name, sku)").lte("quantity", 5),
    supabase
      .from("orders")
      .select("*, profiles(full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const all = orders30 ?? [];
  const nonCancelled = all.filter((o) => o.status !== "cancelled");

  const sum = (rows: typeof all) =>
    rows
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, o) => acc + Number(o.total), 0);

  const count = (rows: typeof all) =>
    rows.filter((o) => o.status !== "cancelled").length;

  const todayRows = all.filter((o) => o.created_at >= since1);
  const weekRows = all.filter((o) => o.created_at >= since7);

  const revenueToday = sum(todayRows);
  const revenue7d = sum(weekRows);
  const revenue30d = sum(all);
  const ordersToday = count(todayRows);
  const orders7d = count(weekRows);
  const orders30d = count(all);
  const aov30d = orders30d > 0 ? revenue30d / orders30d : 0;

  const statusCounts: Record<string, number> = {};
  all.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  });

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const key = toDateKey(daysAgo(i).toISOString());
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of nonCancelled) {
    const key = toDateKey(o.created_at);
    const bucket = dailyMap.get(key);
    if (bucket) {
      bucket.revenue += Number(o.total);
      bucket.orders += 1;
    }
  }

  const dailySeries = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders: v.orders,
  }));

  const weeklyMap = new Map<string, { revenue: number; orders: number }>();
  for (const day of dailySeries) {
    const d = new Date(`${day.date}T00:00:00`);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = toDateKey(weekStart.toISOString());
    const bucket = weeklyMap.get(key) ?? { revenue: 0, orders: 0 };
    bucket.revenue += day.revenue;
    bucket.orders += day.orders;
    weeklyMap.set(key, bucket);
  }
  const weeklySeries = Array.from(weeklyMap.entries()).map(([week, v]) => ({
    week: week.slice(5),
    revenue: v.revenue,
    orders: v.orders,
  }));

  const statusBreakdown = Object.entries(statusCounts).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value,
  }));

  const paymentCounts: Record<string, number> = {};
  for (const o of all) {
    const key = o.payment_status || "unknown";
    paymentCounts[key] = (paymentCounts[key] ?? 0) + 1;
  }
  const paymentBreakdown = Object.entries(paymentCounts).map(
    ([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value,
    }),
  );

  const activeProducts = (products ?? []).filter((p) => p.is_active).length;

  return {
    revenueToday,
    revenue7d,
    revenue30d,
    ordersToday,
    orders7d,
    orders30d,
    aov30d,
    statusCounts,
    statusBreakdown,
    paymentBreakdown,
    totalCustomers: customersRes.count ?? 0,
    newCustomers7d: customers7Res.count ?? 0,
    productCount: products?.length ?? 0,
    activeProducts,
    lowStock: (lowStock ?? []) as LowStockItem[],
    recentOrders: (recentOrders ?? []) as AdminOrder[],
    dailySeries,
    weeklySeries,
  };
}
