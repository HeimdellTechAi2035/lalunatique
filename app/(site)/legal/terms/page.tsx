import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="25 August 2026">
      <p>
        These terms and conditions govern your use of the {SITE_NAME} website and your purchase of products from
        us. By placing an order, you agree to be bound by these terms.
      </p>

      <h2>About us</h2>
      <p>
        {SITE_NAME} is a UK-based retailer of tanning and skincare products. For any questions, contact us at{" "}
        {CONTACT_EMAIL}.
      </p>

      <h2>Orders and acceptance</h2>
      <p>
        An order is an offer to buy, which we may accept or decline. A contract is formed only once we confirm
        your order. We reserve the right to refuse or cancel orders, including where a product is listed at an
        incorrect price due to a system error.
      </p>

      <h2>Pricing and payment</h2>
      <p>
        All prices are shown in GBP and include VAT where applicable. Payment is taken at checkout. We take
        reasonable care to ensure prices are correct, but errors may occur.
      </p>

      <h2>Delivery</h2>
      <p>See our Delivery Information page for shipping methods, costs and estimated timings.</p>

      <h2>Your right to cancel</h2>
      <p>See our Cancellation Rights and Returns & Refunds pages for details of your statutory rights.</p>

      <h2>Liability</h2>
      <p>
        Nothing in these terms limits our liability for death or personal injury caused by negligence, fraud, or
        any other liability that cannot be limited or excluded by law.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the law of England and Wales.</p>
    </LegalPageLayout>
  );
}
