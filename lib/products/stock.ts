import type { Variant } from "./schema";

/**
 * Pure helpers over already-public stock fields — safe to import from
 * client components. Stock lives at variant level (see prisma/schema.prisma),
 * so these operate on a Variant, not a whole Product.
 */
export function isLowStock(variant: Variant | null | undefined): boolean {
  if (!variant) return false;
  return variant.stockQuantity > 0 && variant.stockQuantity <= variant.lowStockThreshold;
}

export function isInStock(variant: Variant | null | undefined): boolean {
  return Boolean(variant && variant.stockQuantity > 0);
}
