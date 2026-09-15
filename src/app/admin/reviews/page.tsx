import { getAdminReviews } from "@/lib/actions/reviews";
import { ReviewsTable } from "@/components/admin/ReviewsTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { firstParam, parsePage, parsePageSize } from "@/lib/admin/list";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const statusRaw = firstParam(sp.status) ?? "all";
  const status =
    statusRaw === "approved" || statusRaw === "pending" ? statusRaw : "all";
  const rating = firstParam(sp.rating) ?? "all";
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const result = await getAdminReviews({ q, status, rating, page, pageSize });
  const query = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
    rating: rating !== "all" ? rating : undefined,
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Reviews</h1>

      <AdminFiltersBar
        fields={[
          {
            type: "search",
            name: "q",
            label: "Search",
            placeholder: "Product, customer, comment…",
          },
          {
            type: "select",
            name: "status",
            label: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
            ],
          },
          {
            type: "select",
            name: "rating",
            label: "Rating",
            options: [
              { value: "all", label: "All ratings" },
              { value: "5", label: "5 stars" },
              { value: "4", label: "4 stars" },
              { value: "3", label: "3 stars" },
              { value: "2", label: "2 stars" },
              { value: "1", label: "1 star" },
            ],
          },
        ]}
      />

      {result.total === 0 ? (
        <p className="text-muted-foreground">No reviews found.</p>
      ) : (
        <>
          <ReviewsTable reviews={result.data} />
          <AdminPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            searchParams={query}
          />
        </>
      )}
    </div>
  );
}
