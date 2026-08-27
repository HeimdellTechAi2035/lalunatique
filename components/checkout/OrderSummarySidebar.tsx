"use client";

import type { CartLine } from "@/lib/cart/types";
import { useOrderTotals } from "@/lib/hooks/useOrderTotals";
import type { ShippingMethodId } from "@/lib/shipping/rules";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartLineItem } from "@/components/cart/CartLineItem";

export function OrderSummarySidebar({
  lines,
  shippingMethodId,
  promoCode,
}: {
  lines: CartLine[];
  shippingMethodId: ShippingMethodId;
  promoCode?: string;
}) {
  const { totals, loading } = useOrderTotals(lines, shippingMethodId, promoCode);

  return (
    <div className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-ink">Order Summary</h2>
      <ul className="mt-3 max-h-72 divide-y divide-border overflow-y-auto">
        {lines.map((line) => (
          <CartLineItem key={`${line.slug}-${line.variantId ?? "base"}`} line={line} compact />
        ))}
      </ul>
      <div className="mt-4 border-t border-border pt-4">
        <CartSummary totals={totals} loading={loading} />
      </div>
    </div>
  );
}
