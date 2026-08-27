"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { checkOrderReadyForSession } from "@/lib/checkout/confirmation-actions";
import { OrderDetail } from "@/components/account/OrderDetail";
import type { Order } from "@/lib/orders/types";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15; // ~30 seconds

/**
 * Stripe confirms payment before this app's own webhook has necessarily
 * finished finalising the Order — usually by well under a second, but
 * never guaranteed. This polls the confirmation state itself rather
 * than assuming "Stripe redirected back" means "order exists"; if the
 * webhook is unusually slow, it gives up and points the customer at
 * their account instead of spinning forever.
 */
export function PaymentProcessingPoll({ sessionId }: { sessionId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (order || attempts >= MAX_POLLS) return;
    const timer = setTimeout(async () => {
      const result = await checkOrderReadyForSession(sessionId);
      if (result.order) {
        setOrder(result.order);
      } else {
        setAttempts((a) => a + 1);
      }
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [sessionId, attempts, order]);

  if (order) {
    return (
      <div className="mt-10">
        <OrderDetail order={order} />
      </div>
    );
  }

  if (attempts >= MAX_POLLS) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 text-center text-sm text-muted">
        <p>
          Your payment went through, but we&apos;re taking longer than usual to finish setting up your order.
          It will appear in your account shortly.
        </p>
        <Link href="/account/orders" className="text-accent hover:underline">
          Check my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-3 text-center text-sm text-muted">
      <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden />
      <p>Payment received — finalising your order…</p>
    </div>
  );
}
