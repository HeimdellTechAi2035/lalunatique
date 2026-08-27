import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { Review } from "@/lib/reviews/mock-data";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4"
            fill={i < review.rating ? "currentColor" : "none"}
            strokeWidth={1.5}
            aria-hidden
          />
        ))}
      </div>
      <h4 className="mt-3 text-sm font-semibold text-ink">{review.title}</h4>
      <p className="mt-1 text-sm text-muted">{review.body}</p>
      <p className="mt-3 text-xs text-muted">
        {review.authorInitial} · {formatDate(review.dateIso)}
      </p>
    </div>
  );
}
