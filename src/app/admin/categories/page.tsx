import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getAdminCategories,
  listAdminCategories,
} from "@/lib/actions/categories";
import { CategoriesTable } from "@/components/admin/CategoriesTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  firstParam,
  parsePage,
  parsePageSize,
  parseStatusFilter,
} from "@/lib/admin/list";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const status = parseStatusFilter(sp.status);
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const [result, allCategories] = await Promise.all([
    listAdminCategories({ q, status, page, pageSize }),
    getAdminCategories(),
  ]);
  const query = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Categories</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/categories/new">Add Category</Link>
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
        ]}
      />

      {result.total === 0 ? (
        <p className="text-muted-foreground">No categories found.</p>
      ) : (
        <>
          <CategoriesTable
            categories={result.data}
            allCategories={allCategories}
          />
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
