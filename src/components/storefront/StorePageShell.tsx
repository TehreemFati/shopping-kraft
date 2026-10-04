import { cn } from "@/lib/utils";

export function StorePageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl min-w-0 px-4 py-6 sm:px-6 sm:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
