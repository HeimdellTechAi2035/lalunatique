"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/context";
import { useOrderTotals } from "@/lib/hooks/useOrderTotals";
import { submitCheckout } from "@/lib/checkout/actions";
import type { ShippingMethodId } from "@/lib/shipping/methods";
import type { CheckoutAddressValues } from "@/lib/validation/checkout";
import { Button } from "@/components/ui/button";
import { CartSummary } from "@/components/cart/CartSummary";

export function ReviewStep({
  address,
  shippingMethodId,
  promoCode,
  onBack,
}: {
  address: CheckoutAddressValues;
  shippingMethodId: ShippingMethodId;
  promoCode: string;
  onBack: () => void;
}) {
  const { state, clear } = useCart();
  const { totals, loading } = useOrderTotals(state.lines, shippingMethodId, promoCode);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function placeOrder() {
    setPlacing(true);
    setError(null);
    const result = await submitCheckout({
      lines: state.lines,
      shippingMethodId,
      promoCode: promoCode || undefined,
      address,
    });
    if (result.ok) {
      clear();
      router.push(`/order-confirmation?order=${result.orderNumber}`);
    } else {
      setError(result.errors[0] ?? "Something went wrong placing your order.");
      setPlacing(false);
    }
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
            <p className="font-medium text-ink">Shipping & payment</p>
            <p className="mt-1 text-muted">{totals?.shippingMethodLabel ?? "…"}</p>
            <p className="mt-1 text-muted">Payment: placeholder (no live provider connected yet)</p>
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
        <Button type="button" size="lg" onClick={placeOrder} disabled={placing || loading || !totals || totals.lines.length === 0}>
          {placing ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </div>
  );
}
