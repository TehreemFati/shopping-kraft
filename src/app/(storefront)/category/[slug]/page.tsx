import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";
import { ImageLinkSlider } from "@/components/storefront/ImageLinkSlider";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import {
  getCategoryById,
  getCategoryBySlug,
  getChildCategories,
  getProductsByCategory,
} from "@/lib/queries/storefront";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, children, parent] = await Promise.all([
    getProductsByCategory(category.id),
    getChildCategories(category.id),
    category.parent_id
      ? getCategoryById(category.parent_id)
      : Promise.resolve(null),
  ]);

  if (!products.length && children.length === 0) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(parent
      ? [
          { label: parent.name, href: `/category/${parent.slug}` },
          { label: category.name },
        ]
      : [{ label: category.name }]),
  ];

  return (
    <StorePageShell>
      <PageBreadcrumbs items={crumbs} />

      <div className="mb-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
        <div>
          <h1 className="font-display text-3xl text-kraft-ink md:text-4xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {category.description}
            </p>
          ) : null}
        </div>
        {category.image_url ? (
          <div className="relative hidden h-36 overflow-hidden md:block">
            <Image
              src={category.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="240px"
            />
          </div>
        ) : null}
      </div>

      {children.length > 0 ? (
        <div className="mb-10">
          <h2 className="mb-4 font-display text-xl text-kraft-ink">
            Subcategories
          </h2>
          <ImageLinkSlider
            ariaLabel="Subcategories"
            size="sm"
            items={children.map((child) => ({
              id: child.id,
              label: child.name,
              href: `/category/${child.slug}`,
              imageUrl: child.image_url,
              description: child.description,
            }))}
          />
        </div>
      ) : null}

      {products.length === 0 ? (
        <p className="text-muted-foreground">
          No products in this category yet. Browse a subcategory above.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </StorePageShell>
  );
}
