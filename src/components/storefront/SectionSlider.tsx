"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const arrowClass =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-kraft-ink/15 bg-white/90 text-kraft-ink shadow-sm backdrop-blur-sm transition duration-300 hover:scale-105 hover:border-kraft-ink hover:bg-kraft-ink hover:text-kraft-citrus hover:shadow-md active:scale-95 md:flex";

  return (
    <div className="relative md:-mx-14 md:px-14">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className={cn(arrowClass, "left-0")}
      >
        <ChevronLeft className="size-5" strokeWidth={2.25} />
      </button>

      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:gap-6"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className={cn(arrowClass, "right-0")}
      >
        <ChevronRight className="size-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
