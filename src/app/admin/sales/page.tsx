import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminSales } from "@/lib/actions/sales";
import { SalesTable } from "@/components/admin/SalesTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  firstParam,
  parsePage,
  parsePageSize,
  parseStatusFilter,
} from "@/lib/admin/list";
import type { SaleCampaignType } from "@/types/database";

export const metadata = { title: "Sales" };

const TYPES: SaleCampaignType[] = [
  "flash",
  "seasonal",
  "clearance",
  "custom",
];

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const status = parseStatusFilter(sp.status);
  const typeRaw = firstParam(sp.sale_type) ?? "all";
  const sale_type = TYPES.includes(typeRaw as SaleCampaignType)
    ? (typeRaw as SaleCampaignType)
    : "all";
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const result = await getAdminSales({ q, status, sale_type, page, pageSize });
  const query = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
    sale_type: sale_type !== "all" ? sale_type : undefined,
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales</h1>
        <Button asChild>
          <Link href="/admin/sales/new">Create Sale</Link>
        </Button>
      </div>

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Name or slug…",
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
            name: "sale_type",
            label: "Type",
            options: [
              { value: "all", label: "All types" },
              { value: "flash", label: "Flash" },
              { value: "seasonal", label: "Seasonal" },
              { value: "clearance", label: "Clearance" },
              { value: "custom", label: "Custom" },
            ],
          },
        ]}
      />

      {result.total === 0 ? (
        <p className="text-muted-foreground">No sales found.</p>
      ) : (
        <>
          <SalesTable campaigns={result.data} />
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
