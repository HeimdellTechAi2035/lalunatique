import "server-only";
import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { consumeReservationsForAttempt, releaseReservationsForAttempt } from "@/lib/products/inventory";

function generateOrderNumber(): string {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `LL-${n}`;
}

function generateTrackingNumber(): string {
  const n = Math.floor(10000000 + Math.random() * 89999999);
  return `TRK-GB-${n}`;
}

/**
 * Turns a paid Stripe Checkout Session into a real Order. This is the
 * ONLY place an Order gets created for a Stripe-paid purchase — never
 * from the browser reaching the success page. Safe to call more than
 * once for the same session (Stripe's at-least-once webhook delivery,
 * or checkout.session.completed and .async_payment_succeeded both
 * firing for certain payment methods):
 *
 * The `updateMany({ where: { status: "PENDING" } })` below is an atomic
 * claim, not a read-then-write check — the same pattern used everywhere
 * else in this codebase for exactly this reason (see
 * lib/products/inventory.ts). Two concurrent calls for the same attempt
 * can't both see "PENDING" and both proceed; whichever commits first
 * flips the row, and the second's updateMany matches zero rows and
 * bails out before touching inventory or creating anything.
 */
export async function finalizeOrderForCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  const checkoutAttemptId = session.metadata?.checkoutAttemptId;
  if (!checkoutAttemptId) return;

  const attempt = await prisma.checkoutAttempt.findUnique({
    where: { id: checkoutAttemptId },
    include: { lines: true },
  });
  if (!attempt) return;
  if (attempt.status === "COMPLETED") return;

  const nowIso = new Date();
  const orderNumber = generateOrderNumber();
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const claim = await tx.checkoutAttempt.updateMany({
      where: { id: checkoutAttemptId, status: "PENDING" },
      data: { status: "COMPLETED" },
    });
    if (claim.count === 0) return; // already finalized by a concurrent/duplicate delivery

    await consumeReservationsForAttempt(tx, checkoutAttemptId, `Order ${orderNumber}`);

    try {
      await tx.order.create({
        data: {
          orderNumber,
          userId: attempt.userId,
          checkoutAttemptId: attempt.id,
          email: attempt.email,
          phone: attempt.phone,
          shippingName: attempt.shippingName,
          shippingLine1: attempt.shippingLine1,
          shippingLine2: attempt.shippingLine2,
          shippingCity: attempt.shippingCity,
          shippingPostcode: attempt.shippingPostcode,
          shippingCountry: attempt.shippingCountry,
          status: "PROCESSING",
          paymentStatus: "PAID",
          subtotalInPence: attempt.subtotalInPence,
          discountInPence: attempt.discountInPence,
          shippingInPence: attempt.shippingInPence,
          totalInPence: attempt.totalInPence,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          amountPaidInPence: session.amount_total ?? attempt.totalInPence,
          paidAt: nowIso,
          trackingNumber: generateTrackingNumber(),
          placedAt: nowIso,
          items: {
            create: attempt.lines.map((l) => ({
              productSlug: l.productSlug,
              productName: l.productName,
              variantSku: l.variantSku,
              variantLabel: l.variantLabel,
              qty: l.qty,
              unitPriceInPence: l.unitPriceInPence,
              lineTotalInPence: l.lineTotalInPence,
            })),
          },
          trackingEvents: {
            create: [{ status: "PROCESSING", label: "Payment confirmed", at: nowIso }],
          },
        },
      });
    } catch (e) {
      // Defense in depth: the unique constraint on Order.checkoutAttemptId
      // means even a bug that let two claims through can't create two
      // orders for the same attempt — the second insert fails here
      // instead. P2002 = Prisma's unique constraint violation code.
      if ((e as { code?: string }).code === "P2002") return;
      throw e;
    }
  });
}

/**
 * Marks a checkout attempt as no longer payable and releases its
 * reservation — used for checkout.session.expired and payment-failure
 * webhook events. Idempotent for the same reason as finalize: only a
 * still-PENDING attempt is affected.
 */
export async function abandonCheckoutAttempt(
  checkoutAttemptId: string,
  toStatus: "EXPIRED" | "FAILED" | "CANCELED",
): Promise<void> {
  const result = await prisma.checkoutAttempt.updateMany({
    where: { id: checkoutAttemptId, status: "PENDING" },
    data: { status: toStatus },
  });
  if (result.count === 0) return;
  await releaseReservationsForAttempt(checkoutAttemptId, toStatus === "EXPIRED" ? "EXPIRED" : "RELEASED");
}
