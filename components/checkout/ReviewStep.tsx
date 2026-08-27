"use client";

import { useRef, useState } from "react";
import { useCart } from "@/lib/cart/context";
import { useOrderTotals } from "@/lib/hooks/useOrderTotals";
import { createCheckoutSession } from "@/lib/checkout/actions";
import type { ShippingMethodId } from "@/lib/shipping/methods";
import type { CheckoutAddressValues } from "@/lib/validation/checkout";
import { Button } from "@/components/ui/button";
import { CartSummary } from "@/components/cart/CartSummary";

export function ReviewStep({
  address,
  shippingMethodId,
  promoCode,
  onBack,
  onReadyForPayment,
}: {
  address: CheckoutAddressValues;
  shippingMethodId: ShippingMethodId;
  promoCode: string;
  onBack: () => void;
  onReadyForPayment: (clientSecret: string) => void;
}) {
  const { state, setQty, removeItem } = useCart();
  const { totals, loading } = useOrderTotals(state.lines, shippingMethodId, promoCode);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated once for the lifetime of this component and reused across
  // retries of the same click (double-click, a network retry) — the
  // server treats a repeated request with this same key as the same
  // checkout attempt rather than reserving stock twice. Reaching this
  // step again after going back and returning gets a fresh key, which
  // is correct: that's a new attempt.
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const hasBasketIssue = Boolean(totals && totals.errors.length > 0);

  /** Applies the server-resolved quantities to the cart without hitting
   * checkout — used both as a client-side pre-check (never even attempt
   * payment for a basket we already know is stale) and as the recovery
   * path when the server rejects an attempt for the same reason. */
  function syncBasketToResolvedTotals() {
    if (!totals) return;
    for (const requested of state.lines) {
      const resolved = totals.lines.find(
        (l) => l.slug === requested.slug && (requested.variantId ? l.variantId === requested.variantId : true),
      );
      if (!resolved) {
        removeItem(requested.slug, requested.variantId);
      } else if (resolved.qty !== requested.qty) {
        setQty(requested.slug, resolved.qty, requested.variantId);
      }
    }
    // A checkout attempt after a basket change is genuinely a different
    // attempt, not a retry of the same one.
    idempotencyKeyRef.current = crypto.randomUUID();
  }

  async function continueToPayment() {
    if (!totals) return;

    // Never even ask to pay for a basket we already know is stale —
    // require the customer to see the corrected basket first.
    if (hasBasketIssue) {
      syncBasketToResolvedTotals();
      setError("Your basket has changed since you last reviewed it — please check the updated total and continue again.");
      return;
    }

    setPlacing(true);
    setError(null);

    const result = await createCheckoutSession({
      idempotencyKey: idempotencyKeyRef.current,
      lines: state.lines,
      shippingMethodId,
      promoCode: promoCode || undefined,
      address,
    });

    if (result.ok) {
      onReadyForPayment(result.clientSecret);
      return;
    }

    if (result.basketChanged) syncBasketToResolvedTotals();
    setError(result.errors[0] ?? "Something went wrong starting checkout.");
    setPlacing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-ink">Review your order</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-4 text-sm">
            <p className="font-medium text-ink">Contact & delivery</p>
            <p className="mt-1 text-muted">{address.email}</p>
            <address className="mt-1 not-italic text-muted">
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.city}, {address.postcode}
              <br />
              {address.country}
            </address>
          </div>
          <div className="rounded-md border border-border p-4 text-sm">
            <p className="font-medium text-ink">Shipping</p>
            <p className="mt-1 text-muted">{totals?.shippingMethodLabel ?? "…"}</p>
          </div>
        </div>
      </div>

      <div className="max-w-sm">
        <CartSummary totals={totals} loading={loading} />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={placing}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={continueToPayment}
          disabled={placing || loading || !totals || totals.lines.length === 0}
        >
          {placing ? "Starting payment…" : hasBasketIssue ? "Update basket" : "Continue to payment"}
        </Button>
      </div>
    </div>
  );
}
