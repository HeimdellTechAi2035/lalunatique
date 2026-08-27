"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PublicProduct } from "@/lib/products/schema";
import type { Category } from "@/lib/products/schema";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export function ShopBrowser({
  products,
  categories,
  activeCategorySlug,
}: {
  products: PublicProduct[];
  categories: Category[];
  activeCategorySlug?: string;
}) {
  const [sort, setSort] = useState<SortOption>("featured");

  const sorted = useMemo(() => {
    const copy = [...products];
    switch (sort) {
      case "price-asc":
        return copy.sort((a, b) => a.priceInPence - b.priceInPence);
      case "price-desc":
        return copy.sort((a, b) => b.priceInPence - a.priceInPence);
      case "name-asc":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }, [products, sort]);

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <nav aria-label="Shop by category" className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              !activeCategorySlug ? "border-ink bg-ink text-on-dark" : "border-border text-muted hover:text-ink",
            )}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop/${category.slug}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                activeCategorySlug === category.slug
                  ? "border-ink bg-ink text-on-dark"
                  : "border-border text-muted hover:text-ink",
              )}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8">
        <ProductGrid products={sorted} />
      </div>
    </div>
  );
}
