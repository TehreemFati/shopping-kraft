import { EmptyState } from "@/components/ui/empty-state";
import {
  getAdminCategories,
  listAdminCategories,
} from "@/lib/actions/categories";
import { CategoriesTable } from "@/components/admin/CategoriesTable";
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
  const editId = firstParam(sp.edit) ?? null;

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
      <AdminPageHeader
        title="Categories"
        description="Top-level aisles. Use the shelves icon to manage subcategories."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
      />

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Name or slug…",
          },
          STATUS_FILTER_FIELD,
        ]}
      />

      {result.total === 0 ? (
        <EmptyState title="No categories found." className="mb-4" />
      ) : null}

      <CategoriesTable
        categories={result.data}
        allCategories={allCategories}
        initialEditId={editId}
      />

      {result.total > 0 ? (
        <AdminPagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
          searchParams={query}
        />
      ) : null}
    </div>
  );
}
