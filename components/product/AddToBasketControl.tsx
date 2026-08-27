"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/context";
import { isInStock } from "@/lib/products/stock";
import type { PublicProduct, Variant } from "@/lib/products/schema";

export function AddToBasketControl({ product, variant }: { product: PublicProduct; variant: Variant | null }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();
  const inStock = isInStock(variant);
  const maxQty = variant?.stockQuantity ?? 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center rounded-md border border-border">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-12 w-12 items-center justify-center hover:bg-cream disabled:opacity-40"
          aria-label="Decrease quantity"
          disabled={qty <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          className="flex h-12 w-12 items-center justify-center hover:bg-cream disabled:opacity-40"
          aria-label="Increase quantity"
          disabled={qty >= maxQty}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button
        size="lg"
        className="flex-1"
        disabled={!inStock || !variant}
        onClick={() => variant && addItem(product.slug, qty, variant.id)}
      >
        {inStock ? "Add to Basket" : "Sold Out"}
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="flex-1"
        disabled={!inStock || !variant}
        onClick={() => {
          if (!variant) return;
          addItem(product.slug, qty, variant.id);
          router.push("/checkout");
        }}
      >
        Buy Now
      </Button>
    </div>
  );
}
