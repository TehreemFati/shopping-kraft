import { EmptyState } from "@/components/ui/empty-state";
import { getAdminOrders } from "@/lib/actions/orders";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  firstParam,
  parsePage,
  parsePageSize,
} from "@/lib/admin/list";
import type { OrderStatus, PaymentStatus } from "@/types/database";

export const metadata = { title: "Orders" };

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const statusRaw = firstParam(sp.status) ?? "all";
  const status = ORDER_STATUSES.includes(
    statusRaw as (typeof ORDER_STATUSES)[number],
  )
    ? (statusRaw as OrderStatus)
    : "all";
  const paymentRaw = firstParam(sp.payment_status) ?? "all";
  const payment_status = PAYMENT_STATUSES.includes(
    paymentRaw as (typeof PAYMENT_STATUSES)[number],
  )
    ? (paymentRaw as PaymentStatus)
    : "all";
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const result = await getAdminOrders({
    q,
    status,
    payment_status,
    page,
    pageSize,
  });

  const query = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
    payment_status: payment_status !== "all" ? payment_status : undefined,
  };

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
      />

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Order number…",
          },
          {
            type: "select",
            name: "status",
            label: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            type: "select",
            name: "payment_status",
            label: "Payment",
            options: [
              { value: "all", label: "All payments" },
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "failed", label: "Failed" },
              { value: "refunded", label: "Refunded" },
            ],
          },
        ]}
      />

      {result.total === 0 ? (
        <EmptyState title="No orders found." />
      ) : (
        <>
          <OrdersTable orders={result.data} />
          <AdminPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            searchParams={query}
          />
        </>
      )}
    </div>
  );
}
