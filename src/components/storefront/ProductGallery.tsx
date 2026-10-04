"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  alt_text?: string | null;
};

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeId, setActiveId] = useState(images[0]?.id ?? "");
  const active =
    images.find((img) => img.id === activeId) ?? images[0] ?? null;

  return (
    <div className="w-full min-w-0 space-y-3 sm:space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted sm:rounded-2xl">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt_text ?? productName}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div
          className={cn(
            "flex gap-2 sm:gap-2.5",
            // Phone: swipe strip. Tablet/laptop: wrap cleanly, no scrollbar.
            "max-sm:overflow-x-auto max-sm:pb-1 max-sm:[scrollbar-width:thin]",
            "sm:flex-wrap",
          )}
        >
          {images.map((img) => {
            const selected = img.id === active?.id;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveId(img.id)}
                aria-label={`View image${selected ? " (selected)" : ""}`}
                aria-pressed={selected}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-lg border transition",
                  "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20 lg:h-[5.5rem] lg:w-[5.5rem]",
                  selected
                    ? "border-kraft-ink ring-2 ring-kraft-ink/25"
                    : "border-border opacity-90 hover:border-kraft-ink/40 hover:opacity-100",
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="88px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
