import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminOrder } from "@/lib/actions/orders";
import { OrderDetail } from "@/components/admin/OrderDetail";

export const metadata = { title: "Order Detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold">Order Detail</h1>
      </div>
      <OrderDetail order={order} />
    </div>
  );
}
