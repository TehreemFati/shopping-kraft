import Link from "next/link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BannerHero } from "@/components/storefront/BannerHero";
import { CategorySlider } from "@/components/storefront/CategorySlider";
import {
  HorizontalSlider,
  SectionHeading,
} from "@/components/storefront/SectionSlider";
import {
  getActiveBanners,
  getFeaturedProducts,
  getLatestProducts,
  getTopSellerProducts,
  getNavCategories,
  getActiveSaleCampaigns,
  getOnSaleProducts,
} from "@/lib/queries/storefront";

export default async function HomePage() {
  const [
    banners,
    categories,
    featured,
    latest,
    topSellers,
    campaigns,
    onSale,
  ] = await Promise.all([
    getActiveBanners(),
    getNavCategories(12),
    getFeaturedProducts(12),
    getLatestProducts(12),
    getTopSellerProducts(12),
    getActiveSaleCampaigns(),
    getOnSaleProducts(12),
  ]);

  const featuredIds = new Set(featured.map((p) => p.id));
  const fresh = latest.filter((p) => !featuredIds.has(p.id)).slice(0, 12);
  const topOnly = topSellers.filter((p) => !featuredIds.has(p.id)).slice(0, 12);

  return (
    <div>
      <BannerHero banners={banners} />

      {categories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            title="Browse categories"
            subtitle="Move through the rooms of the store — each aisle curated with intent."
            href="/shop"
            linkLabel="See everything"
          />
          <CategorySlider categories={categories} />
        </section>
      ) : null}

      {(campaigns.length > 0 || onSale.length > 0) && (
        <section className="border-y border-border/60 bg-kraft-mist/60 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              title="Sales & offers"
              subtitle="Timed campaigns and everyday markdowns."
              href="/shop?on_sale=1"
              linkLabel="Shop On Sale"
            />
            {campaigns.length > 0 ? (
              <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((c) => (
                  <Link
                    key={c.id}
                    href={`/sale/${c.slug}`}
                    className="group border border-border bg-card p-5 transition hover:border-kraft-ink"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                      {c.sale_type}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-kraft-ink group-hover:text-primary">
                      {c.name}
                    </h3>
                    {c.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : null}
            {onSale.length > 0 ? (
              <HorizontalSlider ariaLabel="On sale products">
                {onSale.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="slider"
                  />
                ))}
              </HorizontalSlider>
            ) : null}
          </div>
        </section>
      )}

      {featured.length > 0 ? (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              title="Featured picks"
              subtitle="Editor selections worth a second look."
              href="/shop?featured=1"
              linkLabel="View all"
            />
            <HorizontalSlider ariaLabel="Featured products">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  layout="slider"
                />
              ))}
            </HorizontalSlider>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-kraft-ink py-20 text-white">
        <div className="pointer-events-none absolute inset-0 kraft-grain opacity-40" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.25em] text-kraft-citrus uppercase">
              Why Shopping Kraft
            </p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">
              Good gifts for good relations.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
              Custom wooden baskets, hampers, and occasion gifts — curated with
              care and delivered across Pakistan.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex bg-kraft-citrus px-5 py-3 text-sm font-semibold text-kraft-ink transition hover:brightness-105"
          >
            Start browsing
          </Link>
        </div>
      </section>

      {topOnly.length > 0 || topSellers.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            title="Top sellers"
            subtitle="What customers keep coming back for."
            href="/shop"
            linkLabel="View all"
          />
          <HorizontalSlider ariaLabel="Top sellers">
            {(topOnly.length > 0 ? topOnly : topSellers).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="slider"
              />
            ))}
          </HorizontalSlider>
        </section>
      ) : null}

      {fresh.length > 0 ? (
        <section className="border-t border-border/60 bg-secondary/40 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              title="Just arrived"
              subtitle="Newest pieces added to the floor."
              href="/shop?sort=newest"
              linkLabel="View all"
            />
            <HorizontalSlider ariaLabel="New arrivals">
              {fresh.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  layout="slider"
                />
              ))}
            </HorizontalSlider>
          </div>
        </section>
      ) : latest.length > 0 && featured.length === 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            title="Just arrived"
            subtitle="Newest pieces added to the floor."
            href="/shop?sort=newest"
            linkLabel="View all"
          />
          <HorizontalSlider ariaLabel="New arrivals">
            {latest.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="slider"
              />
            ))}
          </HorizontalSlider>
        </section>
      ) : null}
    </div>
  );
}
