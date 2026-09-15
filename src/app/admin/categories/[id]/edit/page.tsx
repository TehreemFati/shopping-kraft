import { notFound } from "next/navigation";
import { getAdminCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getAdminCategory(id);
  if (!category || category.deleted_at) notFound();

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
      <CategoryForm category={category} />
    </div>
  );
}
