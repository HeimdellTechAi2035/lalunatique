import { SectionHeading } from "@/components/shared/SectionHeading";
import { ReviewCard } from "@/components/product/ReviewCard";
import { getAllReviews } from "@/lib/reviews/mock-data";

export function CustomerReviews() {
  const reviews = getAllReviews().slice(0, 4);
  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <SectionHeading eyebrow="Customer Reviews" title="What people are saying" />
        <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          Sample content
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">Placeholder reviews for demonstration only — not real customer feedback.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
