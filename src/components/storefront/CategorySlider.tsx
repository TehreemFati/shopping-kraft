import Link from "next/link";
import Image from "next/image";
import { HorizontalSlider } from "@/components/storefront/SectionSlider";

const TINTS = [
  "from-amber-900/80 to-stone-950/50",
  "from-orange-900/75 to-stone-900/50",
  "from-rose-900/70 to-stone-950/50",
  "from-stone-800/80 to-amber-950/40",
  "from-yellow-900/70 to-stone-950/50",
];

type SliderCategory = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  description?: string | null;
};

export function CategorySlider({
  categories,
}: {
  categories: SliderCategory[];
}) {
  if (categories.length === 0) return null;

  return (
    <HorizontalSlider ariaLabel="Categories">
      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="group relative h-56 w-[220px] shrink-0 snap-start overflow-hidden sm:w-[240px]"
        >
          {cat.image_url ? (
            <Image
              src={cat.image_url}
              alt={cat.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="240px"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${TINTS[i % TINTS.length]} kraft-grain`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-kraft-ink/85 via-kraft-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-display text-xl text-white">{cat.name}</h3>
            {cat.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-white/70">
                {cat.description}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </HorizontalSlider>
  );
}
