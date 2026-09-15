import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Add Category" };

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add Category"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: "Add" },
        ]}
      />
      <CategoryForm />
    </div>
  );
}
