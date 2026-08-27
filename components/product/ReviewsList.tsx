import { Star } from "lucide-react";
import type { Review } from "@/lib/reviews/mock-data";
import { ReviewCard } from "./ReviewCard";

export function ReviewsList({ reviews, averageRating }: { reviews: Review[]; averageRating: number | null }) {
  return (
    <section className="mt-16">
      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-xl font-semibold text-ink">Reviews</h2>
        <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          Sample content
        </span>
      </div>
      <p className="mb-6 text-xs text-muted">
        These are placeholder reviews for demonstration only — not real customer feedback.
      </p>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet.</p>
      ) : (
        <>
          {averageRating ? (
            <div className="mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 fill-accent text-accent" aria-hidden />
              <span className="text-lg font-semibold text-ink">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted">out of 5 ({reviews.length} sample reviews)</span>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
