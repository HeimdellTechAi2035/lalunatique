import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Payment Information" };

export default function PaymentPage() {
  return (
    <LegalPageLayout title="Payment Information" lastUpdated="25 August 2026">
      <h2>Accepted payment methods</h2>
      <p>
        We plan to accept major debit and credit cards, plus Apple Pay and Google Pay, processed securely through
        Stripe. Live payment processing is not yet enabled on this build — see the checkout page for details.
      </p>

      <h2>Security</h2>
      <p>
        We never see or store your full card details — these are handled directly by our payment processor in
        line with PCI DSS requirements.
      </p>

      <h2>Currency</h2>
      <p>All prices are shown and charged in GBP (£), inclusive of VAT where applicable.</p>

      <h2>Failed payments</h2>
      <p>
        If a payment fails, your order will not be placed and no funds will be taken. Please check your payment
        details and try again, or contact your bank.
      </p>
    </LegalPageLayout>
  );
}
