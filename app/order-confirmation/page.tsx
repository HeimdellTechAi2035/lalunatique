import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { requireStripe } from "@/lib/payments/stripe";
import { getOrderByStripeSessionId } from "@/lib/orders/queries";
import { OrderDetail } from "@/components/account/OrderDetail";
import { PaymentProcessingPoll } from "@/components/checkout/PaymentProcessingPoll";
import { ClearCartOnConfirmation } from "@/components/checkout/ClearCartOnConfirmation";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Order Confirmed" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="relative mx-auto block h-9 w-36">
        <Image src="/brand/la-lunatique-logo.jpg" alt={SITE_NAME} fill sizes="144px" className="object-contain" />
      </Link>
      {children}
      <div className="mt-10 flex justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/orders">View my orders</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Deliberately does NOT trust the mere fact that Stripe redirected the
 * browser here as proof of payment (STAGE 13/11) — a real order only
 * ever exists once the webhook has finalised it (lib/payments/webhook
 * route), and the `session_id` query param is only ever used to look up
 * the ONE order tied to that exact, Stripe-generated, unguessable
 * session id — never a fallback lookup by order number or id, which
 * would let a changed URL expose a different customer's order.
 */
export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <Shell>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted">We couldn&apos;t find that order.</p>
        </div>
      </Shell>
    );
  }

  const stripe = requireStripe();
  let stripeSession;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return (
      <Shell>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted">We couldn&apos;t find that order.</p>
        </div>
      </Shell>
    );
  }

  const order = await getOrderByStripeSessionId(sessionId);

  if (order) {
    return (
      <Shell>
        <ClearCartOnConfirmation />
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
          <h1 className="text-2xl font-semibold text-ink">Thank you — your order is confirmed</h1>
          <p className="text-sm text-muted">
            Order <strong>{order.orderNumber}</strong> has been placed. A confirmation would normally be emailed to
            you here — email sending isn&apos;t connected in this build yet.
          </p>
        </div>
        <div className="mt-10">
          <OrderDetail order={order} />
        </div>
      </Shell>
    );
  }

  if (stripeSession.payment_status === "paid") {
    return (
      <Shell>
        <ClearCartOnConfirmation />
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
          <h1 className="text-2xl font-semibold text-ink">Payment received</h1>
        </div>
        <PaymentProcessingPoll sessionId={sessionId} />
      </Shell>
    );
  }

  if (stripeSession.status === "expired") {
    return (
      <Shell>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <Clock className="h-10 w-10 text-warning" aria-hidden />
          <h1 className="text-2xl font-semibold text-ink">This payment session expired</h1>
          <p className="text-sm text-muted">Nothing was charged. Please return to your basket to try again.</p>
          <Button asChild className="mt-2">
            <Link href="/cart">Return to basket</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <XCircle className="h-10 w-10 text-danger" aria-hidden />
        <h1 className="text-2xl font-semibold text-ink">Payment not completed</h1>
        <p className="text-sm text-muted">Nothing was charged. Please return to your basket to try again.</p>
        <Button asChild className="mt-2">
          <Link href="/cart">Return to basket</Link>
        </Button>
      </div>
    </Shell>
  );
}
