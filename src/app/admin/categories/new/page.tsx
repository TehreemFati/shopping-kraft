import { getAdminCategories } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Add Category" };

export default async function NewCategoryPage() {
  const categories = await getAdminCategories();
  const parentOptions = categories.filter((c) => !c.parent_id);

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
      <CategoryForm parentOptions={parentOptions} />
    </div>
  );
}
