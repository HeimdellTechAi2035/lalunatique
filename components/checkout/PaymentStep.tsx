"use client";

import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/payments/stripe-client";
import { Button } from "@/components/ui/button";

/**
 * Mounts Stripe's own embedded payment UI — card, Apple Pay, Google Pay
 * are always available; Klarna/Clearpay appear automatically only if
 * this Stripe account is actually eligible and has them enabled, never
 * hardcoded here. The clientSecret comes from a Checkout Session
 * already created server-side (see lib/checkout/actions.ts) against a
 * total this app computed itself — nothing about what's charged
 * originates in this component.
 */
export function PaymentStep({ clientSecret, onBack }: { clientSecret: string; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-ink">Payment</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <EmbeddedCheckoutProvider stripe={getStripeClient()} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>

      <Button type="button" variant="outline" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
