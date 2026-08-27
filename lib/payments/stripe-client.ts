"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Lazily initialised, memoised so the Stripe.js script only loads once
 * per page even if the payment step remounts. Resolves to `null` (not
 * a thrown error) if the publishable key is missing — the payment step
 * itself decides how to show that state, rather than this module
 * crashing every page that happens to import it.
 */
export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}
