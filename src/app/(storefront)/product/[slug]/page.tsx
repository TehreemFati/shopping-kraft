import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";
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

  const images = product.product_images?.sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const primaryImage = images?.[0];
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
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text ?? product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {images && images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative h-20 w-20 overflow-hidden rounded-md border"
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {category && (
            <p className="mb-2 text-sm text-muted-foreground">{category.name}</p>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(price)}</span>
            {onSale && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="destructive">Sale</Badge>
              </>
            )}
          </div>

          {product.sku && (
            <p className="mt-2 text-sm text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}

          <p className="mt-2 text-sm">
            {stock > 0 ? (
              <span className="text-green-600">{stock} in stock</span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </p>

          <div className="mt-6">
            <AddToCartButton productId={product.id} disabled={stock <= 0} />
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </StorePageShell>
  );
}
