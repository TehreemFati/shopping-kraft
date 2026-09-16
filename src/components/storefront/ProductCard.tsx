import Link from "next/link";
import Image from "next/image";
import { formatPrice, getEffectivePrice } from "@/lib/utils/format";
import type { ProductWithImages } from "@/types/database";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: ProductWithImages;
  layout?: "grid" | "slider";
}) {
  const primaryImage =
    product.product_images?.find((img) => img.is_primary) ??
    product.product_images?.[0];
  const price = getEffectivePrice(product.price, product.sale_price);
  const onSale =
    product.sale_price !== null && product.sale_price < product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group block",
        layout === "slider" &&
          "w-[220px] shrink-0 snap-start bg-transparent sm:w-[240px]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          layout === "slider"
            ? "aspect-square bg-transparent"
            : "aspect-[4/5] bg-kraft-mist",
        )}
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text ?? product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes={layout === "slider" ? "240px" : "(max-width: 768px) 50vw, 25vw"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {onSale ? (
          <span className="absolute bottom-3 left-3 bg-kraft-ink px-2 py-1 text-[10px] font-semibold tracking-wider text-kraft-citrus uppercase">
            Sale
          </span>
        ) : null}
      </div>
      <div className="pt-3">
        {product.categories ? (
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
            {product.categories.name}
          </p>
        ) : null}
        <h3 className="mt-0.5 font-medium leading-snug text-kraft-ink transition group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-semibold tabular-nums">{formatPrice(price)}</span>
          {onSale ? (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {formatPrice(product.price)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
