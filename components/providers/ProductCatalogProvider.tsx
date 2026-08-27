"use client";

import { createContext, useContext, useMemo } from "react";
import type { PublicProduct } from "@/lib/products/schema";

/**
 * Makes the public (cost-price-stripped) product catalogue available to
 * client components — the cart drawer, basket page, and checkout
 * summary need to look up a product's name/price/image for a given
 * slug without re-fetching. Populated once from a Server Component
 * (see app/layout.tsx) via lib/products/queries.ts, the only sanctioned
 * read path for product data.
 */
const ProductCatalogContext = createContext<Map<string, PublicProduct> | null>(null);

export function ProductCatalogProvider({
  products,
  children,
}: {
  products: PublicProduct[];
  children: React.ReactNode;
}) {
  const map = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  return <ProductCatalogContext.Provider value={map}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const ctx = useContext(ProductCatalogContext);
  if (!ctx) throw new Error("useProductCatalog must be used within a ProductCatalogProvider");
  return ctx;
}

export function useProduct(slug: string): PublicProduct | undefined {
  return useProductCatalog().get(slug);
}
