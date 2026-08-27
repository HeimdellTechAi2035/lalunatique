"use client";

import Link from "next/link";
import type { PublicProduct } from "@/lib/products/schema";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { PriceDisplay } from "./PriceDisplay";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useCart } from "@/lib/cart/context";

export function FrequentlyBoughtTogether({
  baseProduct,
  crossSells,
}: {
  baseProduct: PublicProduct;
  crossSells: PublicProduct[];
}) {
  const { addItem } = useCart();
  if (crossSells.length === 0) return null;

  const allProducts = [baseProduct, ...crossSells];
  const totalPence = allProducts.reduce((sum, p) => sum + p.priceInPence, 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Complete the Routine" title="Frequently bought together" />
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          {allProducts.map((product, i) => (
            <div key={product.slug} className="flex items-center gap-3">
              <Link href={`/products/${product.slug}`} className="flex flex-col items-center gap-2 text-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-md bg-cream">
                  <PlaceholderImage image={product.primaryImage} sizes="80px" />
                </div>
                <span className="max-w-[6rem] text-xs text-ink">{product.name}</span>
              </Link>
              {i < allProducts.length - 1 ? <span className="text-lg text-muted">+</span> : null}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-border p-5 lg:ml-auto">
          <PriceDisplay priceInPence={totalPence} size="md" />
          <Button
            onClick={() => {
              allProducts.forEach((p) => addItem(p.slug, 1));
            }}
          >
            Add all to basket
          </Button>
        </div>
      </div>
    </section>
  );
}
