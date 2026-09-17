import { EmptyState } from "@/components/ui/empty-state";
import { getAdminInventory } from "@/lib/actions/inventory";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { firstParam, parsePage, parsePageSize } from "@/lib/admin/list";

export const metadata = { title: "Inventory" };

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const stockRaw = firstParam(sp.stock) ?? "all";
  const stock =
    stockRaw === "low" || stockRaw === "out" || stockRaw === "in"
      ? stockRaw
      : "all";
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const result = await getAdminInventory({ q, stock, page, pageSize });
  const query = {
    q: q || undefined,
    stock: stock !== "all" ? stock : undefined,
  };

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Inventory" }]}
      />

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Product or SKU…",
          },
          {
            type: "select",
            name: "stock",
            label: "Stock level",
            options: [
              { value: "all", label: "All levels" },
              { value: "in", label: "In stock (>5)" },
              { value: "low", label: "Low (1–5)" },
              { value: "out", label: "Out of stock" },
            ],
          },
        ]}
      />

      {result.total === 0 ? (
        <EmptyState title="No inventory records found." />
      ) : (
        <>
          <InventoryTable items={result.data} />
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
