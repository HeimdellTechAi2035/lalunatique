import "server-only";

/**
 * Payment provider seam. No live payment SDK is installed or called in
 * this build stage — see PaymentStep in the checkout UI, which renders
 * a labeled placeholder instead of collecting real card details.
 *
 * To go live: install `stripe` + `@stripe/stripe-js`, implement
 * `createPaymentIntent` against the Stripe API using STRIPE_SECRET_KEY
 * (see .env.local.example), and swap PaymentStep for Stripe Elements.
 * Nothing else in the checkout flow needs to change — pricing is
 * already resolved server-side in lib/checkout/pricing.ts before this
 * seam would be called.
 */
export type PaymentProvider = {
  createPaymentIntent: (amountInPence: number, currency: "gbp") => Promise<{ clientSecret: string }>;
};

export const mockPaymentProvider: PaymentProvider = {
  async createPaymentIntent() {
    throw new Error(
      "No live payment provider is configured. Stripe integration is a future build stage.",
    );
  },
};
