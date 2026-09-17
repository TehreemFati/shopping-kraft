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
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-tight text-kraft-ink sm:text-3xl">
          Categories
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top-level aisles. Use the shelves icon to manage subcategories.
        </p>
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
        <p className="mb-4 text-muted-foreground">No categories found.</p>
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
