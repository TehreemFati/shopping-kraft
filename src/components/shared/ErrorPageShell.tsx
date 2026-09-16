import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
};

type ErrorPageShellProps = {
  statusCode: 404 | 500;
  title: string;
  message: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
  className?: string;
};

export function ErrorPageShell({
  statusCode,
  title,
  message,
  primaryAction,
  secondaryAction,
  className,
}: ErrorPageShellProps) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center px-4 py-16",
        className,
      )}
    >
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <p className="font-display text-6xl font-semibold text-muted-foreground/40">
            {statusCode}
          </p>
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {primaryAction.href ? (
            <Button variant={primaryAction.variant ?? "default"} asChild>
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
          ) : (
            <Button
              variant={primaryAction.variant ?? "default"}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button variant={secondaryAction.variant ?? "outline"} asChild>
                <Link href={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button
                variant={secondaryAction.variant ?? "outline"}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
