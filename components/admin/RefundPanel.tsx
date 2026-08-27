"use client";

import { useState } from "react";
import { issueRefundAction } from "@/lib/admin/orders/actions";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RefundPanel({
  orderId,
  totalInPence,
  amountRefundedInPence,
  hasStripePayment,
}: {
  orderId: string;
  totalInPence: number;
  amountRefundedInPence: number;
  hasStripePayment: boolean;
}) {
  const remainingInPence = totalInPence - amountRefundedInPence;
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!hasStripePayment) {
    return <p className="text-sm text-muted">No Stripe payment is associated with this order — nothing to refund.</p>;
  }
  if (remainingInPence <= 0) {
    return <p className="text-sm text-muted">This order has been fully refunded.</p>;
  }

  async function submit(amountInPence?: number) {
    setPending(true);
    setMessage(null);
    const result = await issueRefundAction({ orderId, amountInPence });
    if (result.ok) {
      setMessage({ ok: true, text: `Refunded ${formatPrice(result.refundedInPence)}.` });
      setAmount("");
    } else {
      setMessage({ ok: false, text: result.error });
    }
    setPending(false);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {formatPrice(remainingInPence)} refundable of {formatPrice(totalInPence)} total
        {amountRefundedInPence > 0 ? ` (${formatPrice(amountRefundedInPence)} already refunded)` : ""}.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="refund-amount">Partial amount (£, optional)</Label>
          <Input
            id="refund-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder={(remainingInPence / 100).toFixed(2)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => submit(amount ? Math.round(Number(amount) * 100) : undefined)}
        >
          {pending ? "Refunding…" : amount ? "Refund amount" : "Refund full remaining amount"}
        </Button>
      </div>

      {message ? <p className={`text-sm ${message.ok ? "text-success" : "text-danger"}`}>{message.text}</p> : null}
    </div>
  );
}
