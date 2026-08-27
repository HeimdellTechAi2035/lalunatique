"use server";

import { getOrderByStripeSessionId } from "@/lib/orders/queries";
import type { Order } from "@/lib/orders/types";

/**
 * Polled by the confirmation page while payment shows as paid on
 * Stripe's side but the webhook hasn't finalised the Order yet (see
 * STAGE 11: the backend must not depend on the browser returning here —
 * this poll is a UX nicety for the common case where the webhook is
 * only a second or two behind the redirect, not the mechanism that
 * actually finalises anything).
 */
export async function checkOrderReadyForSession(stripeCheckoutSessionId: string): Promise<{ order: Order | null }> {
  const order = await getOrderByStripeSessionId(stripeCheckoutSessionId);
  return { order: order ?? null };
}
