export const DEFAULT_PAGE_SIZE = 20;

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | undefined;

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parsePage(value: string | string[] | undefined, fallback = 1) {
  const raw = Number(firstParam(value) ?? fallback);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

export function parsePageSize(
  value: string | string[] | undefined,
  fallback = DEFAULT_PAGE_SIZE,
) {
  const raw = Number(firstParam(value) ?? fallback);
  if (![10, 20, 50, 100].includes(raw)) return fallback;
  return raw;
}

export function parseStatusFilter(
  value: string | string[] | undefined,
): "all" | "active" | "inactive" {
  const v = firstParam(value);
  if (v === "active" || v === "inactive") return v;
  return "all";
}

export function emptyPage<T>(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): PaginatedResult<T> {
  return { data: [], total: 0, page, pageSize, totalPages: 0 };
}

export function toPaginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export function rangeFromPage(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function buildQueryString(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined> = {},
) {
  const merged = { ...params, ...overrides };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "" && value !== "all") {
      sp.set(key, value);
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
