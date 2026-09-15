"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-3xl tracking-tight text-kraft-ink md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 border-b border-kraft-ink/30 pb-0.5 text-sm font-medium text-kraft-ink transition hover:border-kraft-ink"
        >
          {linkLabel}
          <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function HorizontalSlider({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 420);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-background to-transparent md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-background to-transparent md:block" />

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute top-1/2 left-0 z-20 hidden size-10 -translate-y-1/2 items-center justify-center border border-border bg-card/90 text-foreground backdrop-blur transition hover:bg-card md:flex"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute top-1/2 right-0 z-20 hidden size-10 -translate-y-1/2 items-center justify-center border border-border bg-card/90 text-foreground backdrop-blur transition hover:bg-card md:flex"
      >
        <ChevronRight className="size-5" />
      </button>

      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 md:px-12"
      >
        {children}
      </div>
    </div>
  );
}
