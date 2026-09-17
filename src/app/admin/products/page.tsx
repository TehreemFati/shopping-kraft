import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminProducts } from "@/lib/actions/products";
import { ProductsTable } from "@/components/admin/ProductsTable";
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

export const metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const status = parseStatusFilter(sp.status);
  const featured =
    firstParam(sp.featured) === "yes" || firstParam(sp.featured) === "no"
      ? (firstParam(sp.featured) as "yes" | "no")
      : "all";
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const result = await getAdminProducts({ q, status, featured, page, pageSize });
  const query = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
    featured: featured !== "all" ? featured : undefined,
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
        actions={
          <Button variant="kraft" asChild>
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        }
      />

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Name, SKU, slug…",
          },
          STATUS_FILTER_FIELD,
          {
            type: "select",
            name: "featured",
            label: "Featured",
            options: [
              { value: "all", label: "All" },
              { value: "yes", label: "Featured" },
              { value: "no", label: "Not featured" },
            ],
          },
        ]}
      />

      {result.total === 0 ? (
        <EmptyState
          title="No products found."
          actionLabel="Add Product"
          actionHref="/admin/products/new"
        />
      ) : (
        <>
          <ProductsTable products={result.data} />
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
