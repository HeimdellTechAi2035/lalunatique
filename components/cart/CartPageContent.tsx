"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/context";
import { useOrderTotals } from "@/lib/hooks/useOrderTotals";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { Button } from "@/components/ui/button";
import { FREE_DELIVERY_THRESHOLD_PENCE } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";

export function CartPageContent() {
  const { state } = useCart();
  const { totals, loading } = useOrderTotals(state.lines, "standard");

  if (state.lines.length === 0) return <EmptyCart />;

  const remainingForFreeDelivery = totals ? Math.max(0, FREE_DELIVERY_THRESHOLD_PENCE - totals.subtotalInPence) : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        {remainingForFreeDelivery > 0 ? (
          <p className="mb-4 rounded-md bg-cream px-4 py-2.5 text-sm text-ink">
            Add {formatPrice(remainingForFreeDelivery)} more to get free standard delivery.
          </p>
        ) : null}
        <ul className="divide-y divide-border">
          {state.lines.map((line) => (
            <CartLineItem key={`${line.slug}-${line.variantId ?? "base"}`} line={line} />
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-lg border border-border p-5">
        <CartSummary totals={totals} loading={loading} />
        <Button asChild size="lg" className="mt-4 w-full">
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button asChild variant="outline" className="mt-2 w-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </aside>
    </div>
  );
}
