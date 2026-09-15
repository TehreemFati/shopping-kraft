import { notFound } from "next/navigation";
import { getAdminCategories } from "@/lib/actions/categories";
import { getAdminProduct } from "@/lib/actions/products";
import { getProductVariants } from "@/lib/actions/variants";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantsManager } from "@/components/admin/VariantsManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, variants] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
    getProductVariants(id),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Edit Product"
        description={product.name}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Edit" },
        ]}
      />
      <ProductForm categories={categories} product={product} />
      <div className="mt-8">
        <VariantsManager productId={id} variants={variants} />
      </div>
    </div>
  );
}
