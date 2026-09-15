import { getAdminCategories } from "@/lib/actions/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <AdminPageHeader
        title="Add Product"
        description="Create a gift listing with images, price, and stock."
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Add" },
        ]}
      />
      <ProductForm categories={categories} />
    </div>
  );
}
