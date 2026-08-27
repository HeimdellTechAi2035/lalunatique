"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart/context";

/**
 * The cart is deliberately NOT cleared when a Stripe Checkout Session
 * is created (lib/checkout/actions.ts) — payment could still fail or
 * be abandoned, and the customer should still have their basket to
 * retry with. It's only cleared here, once the confirmation page is
 * actually showing a real, webhook-finalised paid order.
 */
export function ClearCartOnConfirmation() {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
