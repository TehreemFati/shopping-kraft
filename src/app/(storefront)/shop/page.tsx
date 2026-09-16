import Link from "next/link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/queries/storefront";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    featured?: string;
    on_sale?: string;
    sort?: string;
    max_price?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const featured = params.featured === "1";
  const onSale = params.on_sale === "1";
  const maxPriceRaw = Number(params.max_price);
  const maxPrice =
    Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? maxPriceRaw : undefined;
  const sort =
    params.sort === "price_asc" || params.sort === "price_desc"
      ? params.sort
      : "newest";

  const { products, totalPages, total } = await getAllProducts(page, 12, {
    featured,
    onSale,
    sort,
    maxPrice,
  });

  const title = onSale
    ? "On Sale"
    : featured
      ? "Featured"
      : maxPrice
        ? `Under Rs. ${maxPrice.toLocaleString("en-PK")}`
        : sort === "price_desc"
          ? "Premium Gifts"
          : sort === "newest" && !featured && !onSale
            ? "All Products"
            : "Catalog";

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (featured) sp.set("featured", "1");
    if (onSale) sp.set("on_sale", "1");
    if (maxPrice) sp.set("max_price", String(maxPrice));
    if (sort && sort !== "newest") sp.set("sort", sort);
    if (params.sort === "newest") sp.set("sort", "newest");
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop" },
        ]}
      />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-kraft-ink md:text-4xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} product{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!featured && !onSale ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/shop">All</Link>
          </Button>
          <Button variant={featured ? "default" : "outline"} size="sm" asChild>
            <Link href="/shop?featured=1">Featured</Link>
          </Button>
          <Button variant={onSale ? "default" : "outline"} size="sm" asChild>
            <Link href="/shop?on_sale=1">On Sale</Link>
          </Button>
          <Button
            variant={params.sort === "newest" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/shop?sort=newest">Newest</Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">No products available yet.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link href={pageHref(p)}>{p}</Link>
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
