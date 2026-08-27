"use client";

import { formatPrice } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderTotals } from "@/lib/checkout/pricing";

export function CartSummary({ totals, loading }: { totals: OrderTotals | null; loading: boolean }) {
  if (loading || !totals) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    );
  }

  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd>{formatPrice(totals.subtotalInPence)}</dd>
      </div>
      {totals.discountInPence > 0 ? (
        <div className="flex justify-between text-success">
          <dt>{totals.bundleSavingsLabels[0] ?? "Discount"}</dt>
          <dd>-{formatPrice(totals.discountInPence)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between">
        <dt className="text-muted">Delivery</dt>
        <dd>{totals.shippingInPence === 0 ? "Free" : formatPrice(totals.shippingInPence)}</dd>
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-ink">
        <dt>Total</dt>
        <dd>{formatPrice(totals.totalInPence)}</dd>
      </div>
      <p className="text-xs text-muted">Prices include VAT.</p>
      {totals.errors.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-warning">
          {totals.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </dl>
  );
}
