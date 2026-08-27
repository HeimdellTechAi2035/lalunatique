import "server-only";
import { prisma } from "@/lib/db/prisma";
import { requireStripe } from "./stripe";

export type RefundResult = { ok: true; refundedInPence: number } | { ok: false; error: string };

/**
 * Issues a real Stripe refund (full or partial) and only updates the
 * local ledger once Stripe confirms it — amountRefundedInPence and
 * paymentStatus are always derived from what Stripe actually did, never
 * set directly. There is deliberately no path that marks an order
 * refunded without a corresponding successful stripe.refunds.create
 * call.
 *
 * Does NOT touch inventory: whether a refunded item goes back on sale
 * depends on whether it was actually physically returned, which this
 * codebase has no fulfilment/returns workflow to know yet — restocking
 * on refund would be a guess, not a fact.
 */
export async function refundOrder(orderId: string, amountInPence?: number): Promise<RefundResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (!order.stripePaymentIntentId) {
    return { ok: false, error: "This order has no associated Stripe payment to refund." };
  }
  if (order.paymentStatus !== "PAID" && order.paymentStatus !== "REFUNDED") {
    return { ok: false, error: "Only a paid order can be refunded." };
  }

  const remaining = order.totalInPence - order.amountRefundedInPence;
  const requested = amountInPence ?? remaining;
  if (requested <= 0 || requested > remaining) {
    return { ok: false, error: "Refund amount must be greater than zero and no more than what's left to refund." };
  }

  const stripe = requireStripe();
  await stripe.refunds.create(
    { payment_intent: order.stripePaymentIntentId, amount: requested },
    // Same idempotency reasoning as everywhere else in this codebase —
    // a retried refund click for the same already-refunded amount must
    // not double-refund. Keying on the amount already refunded so far
    // means a genuinely new (larger) refund request gets a new key.
    { idempotencyKey: `refund-${orderId}-${order.amountRefundedInPence}-${requested}` },
  );

  const newRefundedTotal = order.amountRefundedInPence + requested;
  await prisma.order.update({
    where: { id: orderId },
    data: {
      amountRefundedInPence: newRefundedTotal,
      paymentStatus: newRefundedTotal >= order.totalInPence ? "REFUNDED" : order.paymentStatus,
    },
  });

  return { ok: true, refundedInPence: requested };
}
