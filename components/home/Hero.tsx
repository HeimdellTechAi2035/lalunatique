import Link from "next/link";
import { Star } from "lucide-react";
import type { PublicProduct } from "@/lib/products/schema";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { getAverageRating, getReviewsForProduct } from "@/lib/reviews/mock-data";

export function Hero({ product }: { product: PublicProduct }) {
  const rating = getAverageRating(product.slug);
  const reviewCount = getReviewsForProduct(product.slug).length;

  return (
    <section className="relative overflow-hidden bg-surface-dark text-on-dark">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-light">The Tan Revolution</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-4 max-w-md text-on-dark/75">{product.shortDescription}</p>

          <div className="mt-6 flex items-center gap-4">
            <PriceDisplay
              priceInPence={product.priceInPence}
              compareAtPriceInPence={product.compareAtPriceInPence}
              size="lg"
              className="text-on-dark [&>span:first-child]:text-on-dark"
            />
            {rating ? (
              <div className="flex items-center gap-1 text-sm text-on-dark/70">
                <Star className="h-4 w-4 fill-accent-light text-accent-light" aria-hidden />
                {rating.toFixed(1)} ({reviewCount} sample reviews)
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="accent" asChild>
              <Link href={`/products/${product.slug}`}>Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-on-dark/30 text-on-dark hover:bg-on-dark/10">
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>

        <div className="relative order-1 aspect-square w-full overflow-hidden rounded-lg lg:order-2">
          <PlaceholderImage image={product.primaryImage} priority sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </div>
    </section>
  );
}
