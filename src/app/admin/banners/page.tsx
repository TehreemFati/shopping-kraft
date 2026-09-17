import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminBanners } from "@/lib/actions/banners";
import { BannersTable } from "@/components/admin/BannersTable";
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

export const metadata = { title: "Banners" };

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const status = parseStatusFilter(sp.status);
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const result = await getAdminBanners({ q, status, page, pageSize });
  const query = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
  };

  return (
    <div>
      <AdminPageHeader
        title="Banners"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Banners" }]}
        actions={
          <Button variant="kraft" asChild>
            <Link href="/admin/banners/new">Add Banner</Link>
          </Button>
        }
      />

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Title or subtitle…",
          },
          STATUS_FILTER_FIELD,
        ]}
      />

      {result.total === 0 ? (
        <EmptyState
          title="No banners found."
          actionLabel="Add Banner"
          actionHref="/admin/banners/new"
        />
      ) : (
        <>
          <BannersTable banners={result.data} />
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
