import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/queries/storefront";
import { getUserOrders } from "@/lib/actions/orders";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils/format";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();
  const orders = await getUserOrders(currentUser!.user.id);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{order.order_number}</CardTitle>
              <Badge variant="outline">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <p className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
