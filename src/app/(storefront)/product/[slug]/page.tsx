import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/queries/storefront";
import { formatPrice, getEffectivePrice } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = (product.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const price = getEffectivePrice(product.price, product.sale_price);
  const onSale =
    product.sale_price !== null && product.sale_price < product.price;
  const stock = product.inventory?.[0]?.quantity ?? 0;
  const category = product.categories;

  return (
    <StorePageShell>
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(category
            ? [
                {
                  label: category.name,
                  href: `/category/${category.slug}`,
                },
              ]
            : [{ label: "Shop", href: "/shop" }]),
          { label: product.name },
        ]}
      />

      {/* Phone: stacked. Tablet/laptop: gallery | details. */}
      <div className="grid min-w-0 gap-6 md:grid-cols-2 md:items-start md:gap-8 lg:gap-12">
        <div className="w-full min-w-0">
          <ProductGallery images={images} productName={product.name} />
        </div>

        <div className="min-w-0 md:sticky md:top-28">
          {category ? (
            <p className="mb-2 text-sm tracking-wide text-muted-foreground uppercase">
              {category.name}
            </p>
          ) : null}
          <h1 className="font-display text-3xl font-bold break-words text-kraft-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold sm:text-3xl">
              {formatPrice(price)}
            </span>
            {onSale ? (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="destructive">Sale</Badge>
              </>
            ) : null}
          </div>

          {product.sku ? (
            <p className="mt-2 text-sm break-all text-muted-foreground">
              SKU: {product.sku}
            </p>
          ) : null}

          <p className="mt-2 text-sm">
            {stock > 0 ? (
              <span className="text-green-600">{stock} in stock</span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </p>

          <div className="mt-6 w-full md:max-w-sm">
            <AddToCartButton productId={product.id} disabled={stock <= 0} />
          </div>

          {product.description ? (
            <div className="mt-8 min-w-0 border-t border-kraft-ink/10 pt-6">
              <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
                Description
              </h2>
              <p className="whitespace-pre-wrap break-words text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </StorePageShell>
  );
}
