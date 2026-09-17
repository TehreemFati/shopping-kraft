import type { FilterField } from "@/components/admin/AdminFilters";

/** Shared active/inactive status filter for admin list pages. */
export const STATUS_FILTER_FIELD: FilterField = {
  type: "select",
  name: "status",
  label: "Status",
  options: [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
};
