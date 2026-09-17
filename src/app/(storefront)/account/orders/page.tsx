import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/queries/storefront";
import { getUserOrders } from "@/lib/actions/orders";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils/format";
import { StoreSectionCard } from "@/components/storefront/store-form";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();
  const orders = await getUserOrders(currentUser!.user.id);

  return (
    <div className="space-y-6">
      <StoreSectionCard
        title="Order history"
        description="Track past and current orders."
      >
        {orders.length === 0 ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-kraft-ink/10 bg-kraft-mist/30 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-kraft-ink">
                    {order.order_number}
                  </p>
                  <Badge variant="outline">
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4">
                      <span className="text-kraft-ink/80">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="shrink-0">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-kraft-ink/10 pt-2 font-semibold text-kraft-ink">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </StoreSectionCard>
    </div>
  );
}
