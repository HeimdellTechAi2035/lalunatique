"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { useProduct } from "@/components/providers/ProductCatalogProvider";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { formatPrice } from "@/lib/utils/format";
import type { CartLine } from "@/lib/cart/types";

export function CartLineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const product = useProduct(line.slug);
  const { setQty, removeItem } = useCart();

  if (!product) return null;
  const variant = product.variants.find((v) => v.id === line.variantId) ?? product.defaultVariant;
  if (!variant) return null;

  const variantLabel = [variant.fragrance, variant.size].filter(Boolean).join(", ");

  return (
    <li className="flex gap-4 py-4">
      <Link href={`/products/${product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cream">
        <PlaceholderImage image={product.primaryImage} sizes="80px" />
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="text-sm font-medium text-ink hover:text-accent">
            {product.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(line.slug, line.variantId)}
            className="text-muted hover:text-danger"
            aria-label={`Remove ${product.name} from basket`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {variantLabel ? <p className="text-xs text-muted">{variantLabel}</p> : null}
        <p className="text-sm text-muted">{formatPrice(variant.priceInPence)}</p>
        {!compact ? (
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty(line.slug, line.qty - 1, line.variantId)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-cream"
              aria-label={`Decrease quantity of ${product.name}`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(line.slug, line.qty + 1, line.variantId)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-cream"
              aria-label={`Increase quantity of ${product.name}`}
              disabled={line.qty >= variant.stockQuantity}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted">Qty {line.qty}</p>
        )}
      </div>
    </li>
  );
}
