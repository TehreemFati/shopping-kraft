import { Star } from "lucide-react";
import type { ApprovedReview } from "@/lib/queries/storefront";

export function HomeReviews({ reviews }: { reviews: ApprovedReview[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Customer stories will appear here once reviews are approved.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review, i) => (
        <blockquote
          key={review.id}
          className="animate-fade-up border-t border-kraft-ink/15 pt-5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex gap-0.5 text-kraft-citrus">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`size-3.5 ${
                  idx < review.rating
                    ? "fill-current"
                    : "text-kraft-ink/20 fill-transparent"
                }`}
              />
            ))}
          </div>
          {review.comment ? (
            <p className="mt-3 text-sm leading-relaxed text-kraft-ink/85">
              “{review.comment}”
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Rated {review.rating}/5
            </p>
          )}
          <footer className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
            {review.authorName}
            {review.productName ? (
              <span className="normal-case tracking-normal">
                {" "}
                · {review.productName}
              </span>
            ) : null}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
