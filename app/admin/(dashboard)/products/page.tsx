import type { Metadata } from "next";
import Link from "next/link";
import { Plus, AlertTriangle, Tag } from "lucide-react";
import { getAllProductsForAdmin } from "@/lib/admin/products/queries";
import { isVariantLowStock, isVariantSoldOut, isSaleActive } from "@/lib/products/inventory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Products", robots: { index: false, follow: false } };

const statusVariant = {
  DRAFT: "outline",
  ACTIVE: "success",
  ARCHIVED: "outline",
  COMING_SOON: "warning",
} as const;

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Products</h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-cream text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Sale</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Content</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const lowStock = product.variants.some((v) => v.active && isVariantLowStock(v));
              const soldOut = product.variants.length > 0 && product.variants.every((v) => !v.active || isVariantSoldOut(v));
              const onSale = product.variants.some((v) => v.active && v.salePriceInPence != null && isSaleActive(v));
              return (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-muted">{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.category.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[product.status]}>{product.status.replace("_", " ").toLowerCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink">{product.priceInPence ? formatPrice(product.priceInPence) : "TBC"}</td>
                  <td className="px-4 py-3">
                    {onSale ? (
                      <span className="inline-flex items-center gap-1 text-xs text-accent">
                        <Tag className="h-3.5 w-3.5" /> On sale
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {soldOut ? (
                      <Badge variant="outline">Sold out</Badge>
                    ) : lowStock ? (
                      <Badge variant="warning">Low</Badge>
                    ) : (
                      <span className="text-muted">
                        {product.variants.reduce((sum, v) => sum + Math.max(0, v.stockQuantity - v.reservedStock), 0)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!product.contentVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" /> Needs verification
                      </span>
                    ) : (
                      <span className="text-xs text-success">Verified</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-accent hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
