import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";
import { getSaleCampaignBySlug } from "@/lib/queries/storefront";
import type { ProductWithImages } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getSaleCampaignBySlug(slug);
  return {
    title: result?.campaign.name ?? "Sale",
  };
}

export default async function SaleCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getSaleCampaignBySlug(slug);
  if (!result) notFound();

  const { campaign, products, prices } = result;

  const displayProducts: ProductWithImages[] = products.map((p) => {
    const campaignPrice = prices[p.id];
    if (campaignPrice !== null && campaignPrice !== undefined) {
      return { ...p, sale_price: campaignPrice };
    }
    return p;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: campaign.name },
        ]}
      />
      <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        {campaign.sale_type} sale
      </p>
      <h1 className="mt-2 font-display text-3xl text-kraft-ink md:text-5xl">
        {campaign.name}
      </h1>
      {campaign.description ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {campaign.description}
        </p>
      ) : null}

      {displayProducts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No products in this sale yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
