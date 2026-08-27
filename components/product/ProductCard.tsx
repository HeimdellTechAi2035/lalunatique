import Link from "next/link";
import type { PublicProduct } from "@/lib/products/schema";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";
import { isInStock } from "@/lib/products/stock";

export function ProductCard({ product }: { product: PublicProduct }) {
  const inStock = isInStock(product.defaultVariant);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-paper transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        <PlaceholderImage
          image={product.primaryImage}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {product.compareAtPriceInPence ? (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-dark">
            Sale
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-medium text-ink">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="flex items-baseline gap-1">
            {product.priceVariesByVariant ? <span className="text-xs text-muted">From</span> : null}
            <PriceDisplay priceInPence={product.priceInPence} compareAtPriceInPence={product.compareAtPriceInPence} size="sm" />
          </span>
          {!inStock ? <StockBadge variant={product.defaultVariant} /> : null}
        </div>
      </div>
    </Link>
  );
}
