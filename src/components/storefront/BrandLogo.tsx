import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** Compact header mark vs larger footer mark */
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  tone?: "onDark" | "onLight";
};

const sizes = {
  sm: { box: "size-10", px: 40 },
  md: { box: "size-12", px: 48 },
  lg: { box: "size-16", px: 64 },
};

export function BrandLogo({
  href = "/",
  className,
  size = "sm",
  showWordmark = true,
  tone = "onDark",
}: BrandLogoProps) {
  const s = sizes[size];
  const onLight = tone === "onLight";

  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-kraft-mist ring-1 ring-kraft-ink/10",
          s.box,
        )}
      >
        <Image
          src="/brand/shopping-kraft-logo.png"
          alt="Shopping Kraft"
          width={s.px}
          height={s.px}
          className="size-full object-cover object-[50%_28%]"
          priority={size === "sm"}
        />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-xl tracking-tight sm:text-2xl",
            onLight ? "text-kraft-ink" : "text-white",
            size === "sm" && "hidden sm:inline",
          )}
        >
          Shopping{" "}
          <span className={onLight ? "text-kraft-ink/70" : "text-kraft-citrus"}>
            Kraft
          </span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="shrink-0 transition hover:opacity-95">
      {mark}
    </Link>
  );
}
