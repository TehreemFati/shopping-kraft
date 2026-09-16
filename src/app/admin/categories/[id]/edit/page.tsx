import { notFound } from "next/navigation";
import {
  getAdminCategories,
  getAdminCategory,
} from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    getAdminCategory(id),
    getAdminCategories(),
  ]);
  if (!category || category.deleted_at) notFound();

  const parentOptions = categories.filter((c) => !c.parent_id && c.id !== id);

  return (
    <div>
      <AdminPageHeader
        title="Edit Category"
        description={category.name}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: "Edit" },
        ]}
      />
      <CategoryForm category={category} parentOptions={parentOptions} />
    </div>
  );
}
