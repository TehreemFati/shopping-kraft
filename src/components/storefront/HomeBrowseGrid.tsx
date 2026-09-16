import Link from "next/link";
import type { HomeLink } from "@/lib/storefront/home-links";
import { cn } from "@/lib/utils";

export function HomeBrowseGrid({
  links,
  variant = "tile",
  columns = "auto",
}: {
  links: HomeLink[];
  variant?: "tile" | "icon" | "plain" | "budget";
  columns?: "auto" | "4" | "3";
}) {
  const gridClass =
    columns === "4"
      ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      : columns === "3"
        ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        : "grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={gridClass}>
      {links.map((link) => {
        const Icon = link.icon;
        const external = link.href.startsWith("http");
        const className = cn(
          "group block transition",
          variant === "icon" &&
            "border border-border/80 bg-white/50 px-4 py-5 text-center hover:border-kraft-ink/40 hover:bg-kraft-mist/80",
          variant === "tile" &&
            "border-b border-border/70 py-4 pr-2 hover:border-kraft-ink",
          variant === "plain" &&
            "border border-transparent py-3 hover:border-kraft-ink/20 hover:bg-white/40",
          variant === "budget" &&
            "border border-kraft-ink/10 bg-kraft-ink px-5 py-6 text-white hover:bg-kraft-ink/90",
        );

        const inner =
          variant === "icon" ? (
            <>
              {Icon ? (
                <Icon
                  className="mx-auto size-6 text-kraft-ink/70 transition group-hover:text-kraft-ink"
                  strokeWidth={1.5}
                />
              ) : null}
              <p className="mt-3 font-medium text-kraft-ink">{link.label}</p>
            </>
          ) : variant === "budget" ? (
            <>
              <p className="font-display text-xl tracking-tight text-kraft-citrus sm:text-2xl">
                {link.label}
              </p>
              {link.description ? (
                <p className="mt-2 text-sm text-white/65">{link.description}</p>
              ) : (
                <p className="mt-2 text-sm text-white/65">Browse this range</p>
              )}
            </>
          ) : (
            <>
              <p className="font-display text-xl text-kraft-ink transition group-hover:text-kraft-ink/80 sm:text-2xl">
                {link.label}
              </p>
              {link.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {link.description}
                </p>
              ) : null}
            </>
          );

        if (external) {
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          );
        }

        return (
          <Link key={link.label} href={link.href} className={className}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
