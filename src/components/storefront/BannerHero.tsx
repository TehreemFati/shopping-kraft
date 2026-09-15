"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types/database";

export function BannerHero({ banners }: { banners: Banner[] }) {
  const slides =
    banners.length > 0
      ? banners
      : [
          {
            id: "fallback",
            title: "Made to be found",
            subtitle: "Curated products with fast delivery across Pakistan.",
            image_url: "",
            link_url: "/shop",
            sort_order: 0,
            is_active: true,
            created_at: "",
            deleted_at: null,
          } satisfies Banner,
        ];

  const [index, setIndex] = useState(0);
  const [, startTransition] = useTransition();
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      startTransition(() => {
        setIndex((i) => (i + 1) % slides.length);
      });
    }, 6000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  function go(dir: -1 | 1) {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }

  const href = current.link_url || "/shop";

  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-kraft-ink text-primary-foreground">
      {current.image_url ? (
        <Image
          key={current.id}
          src={current.image_url}
          alt={current.title}
          fill
          priority
          className="animate-ken object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.4_0.08_160),transparent_55%),linear-gradient(135deg,oklch(0.22_0.04_165),oklch(0.28_0.06_145))] kraft-grain" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-kraft-ink/90 via-kraft-ink/55 to-kraft-ink/20" />

      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:justify-center lg:pb-24">
        <p className="animate-fade-up font-display text-4xl tracking-tight text-kraft-citrus sm:text-5xl md:text-7xl">
          Shopping Kraft
        </p>
        <h1
          className="animate-fade-up mt-4 max-w-xl font-display text-2xl leading-tight text-white sm:text-3xl md:text-4xl"
          style={{ animationDelay: "80ms" }}
        >
          {current.title}
        </h1>
        {current.subtitle ? (
          <p
            className="animate-fade-up mt-3 max-w-md text-base text-white/80 sm:text-lg"
            style={{ animationDelay: "140ms" }}
          >
            {current.subtitle}
          </p>
        ) : null}
        <div
          className="animate-fade-up mt-8"
          style={{ animationDelay: "200ms" }}
        >
          <Link
            href={href}
            className="inline-flex items-center bg-kraft-citrus px-6 py-3 text-sm font-semibold tracking-wide text-kraft-ink transition hover:brightness-105"
          >
            Explore collection
          </Link>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <div className="absolute right-4 bottom-6 z-10 flex gap-2 sm:right-8">
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => go(-1)}
              className="flex size-10 items-center justify-center border border-white/30 bg-black/20 text-white backdrop-blur transition hover:bg-black/40"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => go(1)}
              className="flex size-10 items-center justify-center border border-white/30 bg-black/20 text-white backdrop-blur transition hover:bg-black/40"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 transition-all ${
                  i === index ? "w-8 bg-kraft-citrus" : "w-3 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
