import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireStripe, requireWebhookSecret } from "@/lib/payments/stripe";
import { finalizeOrderForCheckoutSession, abandonCheckoutAttempt } from "@/lib/payments/finalize-order";

/**
 * Stripe webhook receiver. This is the ONLY thing in the whole payment
 * flow allowed to mark an order paid — the success page (see
 * app/order-confirmation) only ever reads state this endpoint already
 * finalised, never sets it. Signature verification is mandatory: an
 * unsigned or badly-signed POST here can't do anything (see
 * lib/payments/stripe.ts: requireWebhookSecret throws if unconfigured).
 *
 * The event claim and every fulfillment change commit in one transaction.
 * A failed delivery rolls back the claim so Stripe can retry it.
 */
export async function POST(request: NextRequest) {
  const stripe = requireStripe();
  const webhookSecret = requireWebhookSecret();

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Signature verification failed: ${(err as Error).message}` }, { status: 400 });
  }

  const duplicate = await prisma.$transaction(async (tx) => {
    const claim = await tx.processedWebhookEvent.createMany({
      data: { id: event.id, type: event.type },
      skipDuplicates: true,
    });
    if (claim.count === 0) return true;

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status === "paid") {
          await finalizeOrderForCheckoutSession(session, tx);
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;
        const checkoutAttemptId = session.metadata?.checkoutAttemptId;
        if (checkoutAttemptId) await abandonCheckoutAttempt(checkoutAttemptId, "EXPIRED", tx);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const checkoutAttemptId = session.metadata?.checkoutAttemptId;
        if (checkoutAttemptId) await abandonCheckoutAttempt(checkoutAttemptId, "FAILED", tx);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const checkoutAttemptId = paymentIntent.metadata?.checkoutAttemptId;
        if (checkoutAttemptId) await abandonCheckoutAttempt(checkoutAttemptId, "FAILED", tx);
        break;
      }
      default:
        // Every other event type is intentionally ignored — nothing else
        // in this checkout flow needs it, and staying quiet keeps this
        // handler's job legible: finalise, expire, or fail an attempt.
        break;
    }
    return false;
  });

  return NextResponse.json(duplicate ? { received: true, duplicate: true } : { received: true });
}
