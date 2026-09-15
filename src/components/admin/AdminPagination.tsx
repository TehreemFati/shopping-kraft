import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildQueryString } from "@/lib/admin/list";

export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  searchParams,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const base = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([key, value]) => key !== "page" && value !== undefined && value !== "",
    ),
  ) as Record<string, string | undefined>;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!prev} asChild={!!prev}>
          {prev ? (
            <Link href={buildQueryString(base, { page: String(prev) })}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Prev
            </Link>
          ) : (
            <span>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Prev
            </span>
          )}
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button variant="outline" size="sm" disabled={!next} asChild={!!next}>
          {next ? (
            <Link href={buildQueryString(base, { page: String(next) })}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
