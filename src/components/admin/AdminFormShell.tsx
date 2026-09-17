import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminFormShell({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const showHeader = Boolean(title || description);

  return (
    <div
      className={cn(
        "animate-fade-up w-full overflow-hidden rounded-2xl border border-kraft-ink/10 bg-card/80 shadow-sm ring-1 ring-kraft-ink/5",
        className,
      )}
    >
      {showHeader ? (
        <div className="relative border-b border-kraft-ink/10 bg-kraft-mist/50 px-6 py-5">
          <div className="pointer-events-none absolute inset-0 kraft-grain opacity-30" />
          <div className="relative">
            {title ? (
              <h2 className="font-display text-2xl text-kraft-ink">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="space-y-6 p-5 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-xl border border-kraft-ink/10 bg-kraft-mist/25 p-4 sm:p-5 lg:p-6",
        className,
      )}
    >
      <div>
        <h3 className="text-xs font-semibold tracking-[0.16em] text-kraft-ink uppercase">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Sticky save/cancel bar inside the scrolling main pane. */
export function AdminFormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-5 mt-2 flex flex-wrap items-center gap-2 border-t border-kraft-ink/10 bg-card/95 px-5 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}
