import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-[40vh] flex-1 items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-kraft-ink/10 bg-card/90 px-5 py-3 shadow-sm">
        <Loader2 className="size-5 animate-spin text-kraft-ink" />
        <span className="text-sm font-medium text-kraft-ink">Loading…</span>
      </div>
    </div>
  );
}
