import "server-only";

/**
 * SAMPLE REVIEWS — placeholder content for demonstration only. These
 * are not real customer reviews. They are deliberately excluded from
 * any SEO structured data (no aggregateRating in Product JSON-LD) so
 * search engines are never shown a fabricated rating.
 */
export type Review = {
  id: string;
  productSlug: string;
  authorInitial: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  dateIso: string;
};

const rawReviews: Review[] = [
  {
    id: "rev_1",
    productSlug: "tanning-mousse",
    authorInitial: "S.",
    rating: 5,
    title: "Sample review — best mousse I've tried",
    body: "Sample placeholder review content. Applied evenly and gave an immediate colour that kept developing.",
    dateIso: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "rev_2",
    productSlug: "tanning-mousse",
    authorInitial: "K.",
    rating: 4,
    title: "Sample review — great colour, dries fast",
    body: "Sample placeholder review content. Easy to apply with a mitt and dried quickly.",
    dateIso: "2026-07-15T00:00:00.000Z",
  },
  {
    id: "rev_3",
    productSlug: "tanning-mist",
    authorInitial: "A.",
    rating: 5,
    title: "Sample review — perfect for touch-ups",
    body: "Sample placeholder review content. Quick to apply before work, no mitt needed.",
    dateIso: "2026-07-20T00:00:00.000Z",
  },
];

export function getReviewsForProduct(slug: string): Review[] {
  return rawReviews.filter((r) => r.productSlug === slug);
}

export function getAverageRating(slug: string): number | null {
  const reviews = getReviewsForProduct(slug);
  if (reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function getAllReviews(): Review[] {
  return rawReviews;
}
