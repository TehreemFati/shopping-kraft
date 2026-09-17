import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Taller kraft-styled input classes for customer forms only. */
export const storeInputClassName =
  "h-11 rounded-xl border-kraft-ink/15 bg-kraft-mist/50 px-3.5 text-sm text-kraft-ink placeholder:text-kraft-ink/40 focus-visible:border-kraft-ink/25 focus-visible:ring-kraft-citrus/35";

export function StoreFormField({
  label,
  htmlFor,
  children,
  className,
  hint,
  required,
  error,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-kraft-ink/85">
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function StoreSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "border-0 bg-white/80 shadow-none ring-1 ring-kraft-ink/10",
        className,
      )}
    >
      <CardHeader className="border-b border-kraft-ink/10 bg-kraft-mist/40">
        <CardTitle className="font-display text-lg text-kraft-ink">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}
