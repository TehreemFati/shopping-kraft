import Link from "next/link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BannerHero } from "@/components/storefront/BannerHero";
import { HomeBrowseGrid } from "@/components/storefront/HomeBrowseGrid";
import { HomeReviews } from "@/components/storefront/HomeReviews";
import { ImageLinkSlider } from "@/components/storefront/ImageLinkSlider";
import {
  HorizontalSlider,
  SectionHeading,
} from "@/components/storefront/SectionSlider";
import {
  BUDGET_LINKS,
  CUSTOM_GIFT_LINKS,
  OCCASION_LINKS,
  RECIPIENT_LINKS,
  WHATSAPP_CUSTOMIZE_URL,
} from "@/lib/storefront/home-links";
import {
  getActiveBanners,
  getActiveSaleCampaigns,
  getApprovedReviews,
  getLatestProducts,
  getNavCategories,
  getOnSaleProducts,
  getTopSellerProducts,
} from "@/lib/queries/storefront";

export default async function HomePage() {
  const [banners, categories, bestSellers, latest, campaigns, onSale, reviews] =
    await Promise.all([
      getActiveBanners(),
      getNavCategories(12),
      getTopSellerProducts(8),
      getLatestProducts(8),
      getActiveSaleCampaigns(),
      getOnSaleProducts(8),
      getApprovedReviews(6),
    ]);

  const bestIds = new Set(bestSellers.map((p) => p.id));
  const newArrivals = latest
    .filter((p) => !bestIds.has(p.id))
    .slice(0, 8);
  const arrivals = newArrivals.length > 0 ? newArrivals : latest.slice(0, 8);

  return (
    <div>
      <BannerHero banners={banners} />

      <section
        id="occasions"
        className="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16"
      >
        <SectionHeading
          title="Shop by Occasion"
          subtitle="Find the right gift for the moment that matters."
        />
        <ImageLinkSlider
          ariaLabel="Occasions"
          items={OCCASION_LINKS.map((l) => ({
            id: l.label,
            label: l.label,
            href: l.href,
            imageUrl: l.imageUrl,
            description: l.description,
            icon: l.icon,
          }))}
        />
      </section>

      <section className="border-y border-border/60 bg-kraft-mist/50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            title="Shop by Category"
            subtitle="Browse the aisles — boxes, baskets, bouquets, and more."
            href="/shop"
            linkLabel="Full catalog"
          />
          <ImageLinkSlider
            ariaLabel="Categories"
            items={categories.map((c) => ({
              id: c.id,
              label: c.name,
              href: `/category/${c.slug}`,
              imageUrl: c.image_url,
              description:
                c.children.length > 0
                  ? `${c.children.length} subcategor${c.children.length === 1 ? "y" : "ies"}`
                  : undefined,
            }))}
          />
        </div>
      </section>

      {bestSellers.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHeading
            title="Best Sellers"
            subtitle="What customers keep coming back for."
            href="/shop"
            linkLabel="View all"
          />
          <HorizontalSlider ariaLabel="Best sellers">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="slider"
              />
            ))}
          </HorizontalSlider>
        </section>
      ) : null}

      {arrivals.length > 0 ? (
        <section className="border-t border-border/60 bg-secondary/35 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              title="New Arrivals"
              subtitle="Fresh pieces just added to the floor."
              href="/shop?sort=newest"
              linkLabel="View all"
            />
            <HorizontalSlider ariaLabel="New arrivals">
              {arrivals.map((product) => (
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

      <section className="relative overflow-hidden bg-kraft-ink py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 kraft-grain opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.25em] text-kraft-citrus uppercase">
                Made for you
              </p>
              <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">
                Personalized / Custom Gifts
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                Tell us the occasion, budget, and who it’s for — we’ll craft
                something that feels personal.
              </p>
            </div>
            <a
              href={WHATSAPP_CUSTOMIZE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 bg-kraft-citrus px-5 py-3 text-sm font-semibold text-kraft-ink transition hover:brightness-105"
            >
              Start on WhatsApp
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CUSTOM_GIFT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-white/15 px-4 py-5 transition hover:border-kraft-citrus/60 hover:bg-white/5"
              >
                <p className="font-display text-xl text-white group-hover:text-kraft-citrus">
                  {link.label}
                </p>
                {link.description ? (
                  <p className="mt-2 text-sm text-white/60">{link.description}</p>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="gifts-for"
        className="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16"
      >
        <SectionHeading
          title="Gifts by Recipient"
          subtitle="Start with who you’re shopping for."
        />
        <ImageLinkSlider
          ariaLabel="Gifts by recipient"
          items={RECIPIENT_LINKS.map((l) => ({
            id: l.label,
            label: l.label,
            href: l.href,
            imageUrl: l.imageUrl,
            description: l.description,
            icon: l.icon,
          }))}
        />
      </section>

      <section className="border-y border-border/60 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            title="Budget Gifts"
            subtitle="Pick a range and we’ll show what fits."
            href="/shop"
            linkLabel="Browse all"
          />
          <HomeBrowseGrid links={BUDGET_LINKS} variant="budget" columns="4" />
        </div>
      </section>

      {(campaigns.length > 0 || onSale.length > 0) && (
        <section className="bg-kraft-mist/60 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              title="Sale / Special Offers"
              subtitle="Timed campaigns and everyday markdowns."
              href="/shop?on_sale=1"
              linkLabel="Shop on sale"
            />
            {campaigns.length > 0 ? (
              <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((c) => (
                  <Link
                    key={c.id}
                    href={`/sale/${c.slug}`}
                    className="group border border-border bg-card/60 p-5 transition hover:border-kraft-ink"
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

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          title="Customer Reviews"
          subtitle="Real notes from people who shopped with us."
        />
        <HomeReviews reviews={reviews} />
      </section>
    </div>
  );
}
