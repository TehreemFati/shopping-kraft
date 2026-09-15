import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminCoupons } from "@/lib/actions/coupons";
import { CouponsTable } from "@/components/admin/CouponsTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button asChild>
          <Link href="/admin/coupons/new">Add Coupon</Link>
        </Button>
      </div>

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Coupon code…",
          },
          {
            type: "select",
            name: "status",
            label: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
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
        <p className="text-muted-foreground">No coupons found.</p>
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
