import { cn } from "@/lib/utils";

type AuthExperienceProps = {
  mode: "login" | "register";
  children: React.ReactNode;
  className?: string;
};

const copy = {
  login: {
    eyebrow: "Shopping Kraft",
    headline: "Continue your\ngift journey",
    body: "Sign in to track orders, reuse saved addresses, and find the perfect present again.",
  },
  register: {
    eyebrow: "Join Shopping Kraft",
    headline: "Start crafting\nmoments",
    body: "Create an account to save favourites, manage deliveries, and checkout faster.",
  },
} as const;

export function AuthExperience({
  mode,
  children,
  className,
}: AuthExperienceProps) {
  const c = copy[mode];

  return (
    <div
      className={cn(
        "relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12",
        className,
      )}
    >
      <div className="overflow-hidden rounded-3xl ring-1 ring-kraft-ink/10 lg:grid lg:min-h-[min(72vh,40rem)] lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative flex flex-col justify-between overflow-hidden bg-kraft-ink px-8 py-10 text-white sm:px-10 sm:py-12 lg:px-12">
          <div
            className="pointer-events-none absolute inset-0 kraft-grain opacity-40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-kraft-citrus/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-[oklch(0.45_0.06_30/0.45)] blur-3xl"
            aria-hidden
          />

          {/* Floating gift shapes */}
          <div
            className="pointer-events-none absolute top-16 right-10 hidden animate-[kraft-float_7s_ease-in-out_infinite] sm:block"
            aria-hidden
          >
            <GiftBox className="size-16 rotate-6 opacity-90" />
          </div>
          <div
            className="pointer-events-none absolute right-24 bottom-28 hidden animate-[kraft-float_9s_ease-in-out_infinite_reverse] md:block"
            aria-hidden
          >
            <GiftBox className="size-12 -rotate-12 opacity-70" />
          </div>
          <div
            className="pointer-events-none absolute bottom-16 left-10 animate-[kraft-float_8s_ease-in-out_infinite]"
            aria-hidden
          >
            <Ribbon className="h-20 w-28 opacity-80" />
          </div>

          <div className="relative z-10 animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.22em] text-kraft-citrus uppercase">
              {c.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight whitespace-pre-line sm:text-5xl lg:text-[3.25rem]">
              {c.headline}
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
              {c.body}
            </p>
          </div>

          <div
            className="relative z-10 mt-10 flex flex-wrap gap-6 text-xs tracking-wide text-white/55 sm:mt-16"
            style={{ animationDelay: "120ms" }}
          >
            <span className="animate-fade-up">Curated gifts</span>
            <span className="animate-fade-up" style={{ animationDelay: "80ms" }}>
              Across Pakistan
            </span>
            <span
              className="animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              Custom hampers
            </span>
          </div>
        </aside>

        {/* Form panel */}
        <div className="relative flex flex-col justify-center bg-[oklch(0.985_0.004_95)] px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,oklch(0.9_0.05_55/0.35),transparent_55%)]"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-md animate-fade-up [animation-delay:80ms]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function GiftBox({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="10"
        y="24"
        width="44"
        height="32"
        rx="3"
        fill="oklch(0.84 0.09 55)"
        opacity="0.95"
      />
      <rect
        x="8"
        y="18"
        width="48"
        height="10"
        rx="2"
        fill="oklch(0.9 0.07 55)"
      />
      <rect x="29" y="18" width="6" height="38" fill="oklch(0.32 0.05 50)" />
      <path
        d="M32 18 C26 8 16 10 18 18 C22 10 32 12 32 18 Z"
        fill="oklch(0.32 0.05 50)"
      />
      <path
        d="M32 18 C38 8 48 10 46 18 C42 10 32 12 32 18 Z"
        fill="oklch(0.32 0.05 50)"
      />
    </svg>
  );
}

function Ribbon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" className={className} aria-hidden>
      <path
        d="M8 48 C28 28 52 28 72 48 C88 62 108 58 116 42"
        stroke="oklch(0.84 0.09 55)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M12 56 C32 36 56 36 76 56"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
