import { Badge } from "@/components/ui/badge";
import type { Variant } from "@/lib/products/schema";
import { isInStock, isLowStock } from "@/lib/products/stock";

export function StockBadge({ variant }: { variant: Variant | null | undefined }) {
  if (!isInStock(variant)) return <Badge variant="outline">Sold out</Badge>;
  if (isLowStock(variant)) return <Badge variant="warning">Only {variant!.stockQuantity} left</Badge>;
  return <Badge variant="success">In stock</Badge>;
}
