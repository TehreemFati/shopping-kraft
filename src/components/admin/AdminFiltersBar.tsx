import { Suspense } from "react";
import { AdminFilters, type FilterField } from "@/components/admin/AdminFilters";

export function AdminFiltersBar({ fields }: { fields: FilterField[] }) {
  return (
    <Suspense
      fallback={
        <div className="mb-6 h-16 animate-pulse rounded-lg border bg-muted/30" />
      }
    >
      <AdminFilters fields={fields} />
    </Suspense>
  );
}
