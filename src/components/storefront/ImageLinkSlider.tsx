import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { HorizontalSlider } from "@/components/storefront/SectionSlider";
import { cn } from "@/lib/utils";

const TINTS = [
  "from-amber-900/85 to-stone-950/55",
  "from-orange-900/80 to-stone-900/55",
  "from-rose-900/75 to-stone-950/55",
  "from-stone-800/85 to-amber-950/45",
  "from-yellow-900/75 to-stone-950/55",
  "from-stone-900/80 to-orange-950/50",
];

export type ImageSlideItem = {
  id: string;
  label: string;
  href: string;
  imageUrl?: string | null;
  description?: string | null;
  icon?: LucideIcon;
};

export function ImageLinkSlider({
  items,
  ariaLabel,
  size = "md",
}: {
  items: ImageSlideItem[];
  ariaLabel: string;
  size?: "sm" | "md";
}) {
  if (items.length === 0) return null;

  const dim =
    size === "sm"
      ? "h-44 w-[160px] sm:w-[180px]"
      : "h-56 w-[200px] sm:w-[230px]";

  return (
    <HorizontalSlider ariaLabel={ariaLabel}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group relative shrink-0 snap-start overflow-hidden",
              dim,
            )}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.label}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="230px"
              />
            ) : (
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br kraft-grain",
                  TINTS[i % TINTS.length],
                )}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-kraft-ink/90 via-kraft-ink/25 to-transparent transition group-hover:from-kraft-ink/95" />
            {!item.imageUrl && Icon ? (
              <Icon
                className="absolute top-4 left-4 size-7 text-white/35 transition group-hover:text-kraft-citrus/80"
                strokeWidth={1.25}
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-display text-lg leading-tight text-white sm:text-xl">
                {item.label}
              </h3>
              {item.description ? (
                <p className="mt-1 line-clamp-2 text-xs text-white/70">
                  {item.description}
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </HorizontalSlider>
  );
}
