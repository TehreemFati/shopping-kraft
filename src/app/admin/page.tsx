import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { getAnalyticsDashboard } from "@/lib/actions/analytics";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils/format";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getAnalyticsDashboard();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(stats.revenueToday)}</p>
            <p className="text-xs text-muted-foreground">{stats.ordersToday} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue 7d
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(stats.revenue7d)}</p>
            <p className="text-xs text-muted-foreground">{stats.orders7d} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue 30d
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(stats.revenue30d)}</p>
            <p className="text-xs text-muted-foreground">
              AOV {formatPrice(stats.aov30d)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            <p className="text-xs text-muted-foreground">
              +{stats.newCustomers7d} new (7d)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.productCount}</p>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} active
            </p>
          </CardContent>
        </Card>
        {["pending", "processing", "shipped", "delivered"].map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {ORDER_STATUS_LABELS[status] ?? status}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.statusCounts[status] ?? 0}
              </p>
              <Button variant="link" className="h-auto p-0 text-xs" asChild>
                <Link href={`/admin/orders?status=${status}`}>View orders</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts
        dailySeries={stats.dailySeries}
        weeklySeries={stats.weeklySeries}
        statusBreakdown={stats.statusBreakdown}
        paymentBreakdown={stats.paymentBreakdown}
      />

      {stats.lowStock.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low stock alerts</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/inventory?stock=low">Inventory</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStock.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between">
                  <span>{inv.products?.name ?? "Unknown"}</span>
                  <Badge variant="destructive">{inv.quantity} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    <p className="mt-1 font-semibold">{formatPrice(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
