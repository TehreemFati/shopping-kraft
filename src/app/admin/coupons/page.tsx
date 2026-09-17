import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminCoupons } from "@/lib/actions/coupons";
import { CouponsTable } from "@/components/admin/CouponsTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { STATUS_FILTER_FIELD } from "@/lib/admin/status-filter";
import {
  firstParam,
  parsePage,
  parsePageSize,
  parseStatusFilter,
} from "@/lib/admin/list";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const status = parseStatusFilter(sp.status);
  const typeRaw = firstParam(sp.type) ?? "all";
  const type =
    typeRaw === "percentage" || typeRaw === "fixed" ? typeRaw : "all";
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const result = await getAdminCoupons({ q, status, type, page, pageSize });
  const query = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
    type: type !== "all" ? type : undefined,
  };

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Coupons" }]}
        actions={
          <Button variant="kraft" asChild>
            <Link href="/admin/coupons/new">Add Coupon</Link>
          </Button>
        }
      />

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Coupon code…",
          },
          STATUS_FILTER_FIELD,
          {
            type: "select",
            name: "type",
            label: "Type",
            options: [
              { value: "all", label: "All types" },
              { value: "percentage", label: "Percentage" },
              { value: "fixed", label: "Fixed" },
            ],
          },
        ]}
      />

      {result.total === 0 ? (
        <EmptyState
          title="No coupons found."
          actionLabel="Add Coupon"
          actionHref="/admin/coupons/new"
        />
      ) : (
        <>
          <CouponsTable coupons={result.data} />
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
