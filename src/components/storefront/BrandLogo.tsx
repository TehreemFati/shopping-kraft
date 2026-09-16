import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** Compact header mark vs larger footer mark */
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const sizes = {
  sm: { box: "h-10 w-10", img: 40 },
  md: { box: "h-12 w-12", img: 48 },
  lg: { box: "h-16 w-16", img: 64 },
};

export function BrandLogo({
  href = "/",
  className,
  size = "sm",
  showWordmark = true,
}: BrandLogoProps) {
  const s = sizes[size];

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
          width={s.img}
          height={s.img}
          className="object-contain p-0.5"
          priority={size === "sm"}
        />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-xl tracking-tight text-white sm:text-2xl",
            size === "sm" && "hidden sm:inline",
          )}
        >
          Shopping <span className="text-kraft-citrus">Kraft</span>
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
