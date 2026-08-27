import "server-only";
import Stripe from "stripe";

/**
 * The Stripe SDK singleton. Deliberately does NOT throw at module-import
 * time if unconfigured — that would crash builds/pages that never touch
 * payments just because STRIPE_SECRET_KEY isn't set yet. Instead,
 * `requireStripe()` throws the moment something actually tries to use
 * it, which is the point at which an unconfigured payment path is
 * genuinely unsafe to proceed past.
 */
const secretKey = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = Boolean(secretKey);

export const stripe: Stripe | null = secretKey
  ? new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia", typescript: true })
  : null;

/**
 * Call this at the start of every code path that actually creates a
 * Stripe session, retrieves one, or handles a webhook. Refuses outright
 * in production — a live deployment must never silently run with
 * payments half-configured.
 */
export function requireStripe(): Stripe {
  if (!stripe) {
    const message =
      "STRIPE_SECRET_KEY is not set. Payments are not configured — see .env.local.example.";
    if (process.env.NODE_ENV === "production") {
      throw new Error(`${message} Refusing to process payments in production without it.`);
    }
    throw new Error(message);
  }
  return stripe;
}

export function requireWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set — refusing to accept webhook requests without signature verification.",
    );
  }
  return secret;
}
