import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/lib/actions/products";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Name, SKU, slug…",
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
        <p className="text-muted-foreground">No products found.</p>
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
