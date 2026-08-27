"use client";

import { useEffect, useState } from "react";
import { calculateOrderTotals, type OrderTotals } from "@/lib/checkout/pricing";
import type { CartLine } from "@/lib/cart/types";
import type { ShippingMethodId } from "@/lib/shipping/rules";

/**
 * Calls the server-side pricing seam (lib/checkout/pricing.ts) and
 * renders its response — never a client-computed total. This is the
 * pattern used by both /cart and the checkout review step so the
 * number shown always matches what would actually be charged.
 */
export function useOrderTotals(
  lines: CartLine[],
  shippingMethodId: ShippingMethodId,
  promoCode?: string,
) {
  const [totals, setTotals] = useState<OrderTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const isEmpty = lines.length === 0;

  const linesKey = JSON.stringify(lines);

  useEffect(() => {
    if (isEmpty) return;
    let cancelled = false;
    // Marking the in-flight fetch as loading is tied to the async
    // operation started right below, not a value derivable at render
    // time — a legitimate effect use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    calculateOrderTotals({ lines, shippingMethodId, promoCode }).then((result) => {
      if (!cancelled) {
        setTotals(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey, shippingMethodId, promoCode, isEmpty]);

  // The empty-basket case needs no async work, so it's derived directly
  // at render time rather than mirrored into state from an effect.
  return isEmpty ? { totals: null, loading: false } : { totals, loading };
}
