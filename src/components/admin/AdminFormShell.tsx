import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminFormShell({
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
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <div className="relative border-b border-border/60 bg-kraft-mist/50 px-6 py-5">
        <div className="pointer-events-none absolute inset-0 kraft-grain opacity-30" />
        <div className="relative">
          <h2 className="font-display text-2xl text-kraft-ink">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-6 p-6">{children}</div>
    </div>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-kraft-ink uppercase">
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

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}
