import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { FREE_DELIVERY_THRESHOLD_PENCE, STANDARD_DELIVERY_PENCE, EXPRESS_DELIVERY_PENCE } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Delivery Information" };

export default function DeliveryPage() {
  return (
    <LegalPageLayout title="Delivery Information" lastUpdated="25 August 2026">
      <h2>Delivery options</h2>
      <ul>
        <li>Standard Delivery — {formatPrice(STANDARD_DELIVERY_PENCE)}, 2–3 working days</li>
        <li>Express Delivery — {formatPrice(EXPRESS_DELIVERY_PENCE)}, next working day</li>
        <li>Free Standard Delivery on orders over {formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)}</li>
      </ul>

      <h2>Delivery area</h2>
      <p>We currently deliver to addresses within the United Kingdom.</p>

      <h2>Order processing</h2>
      <p>
        Orders are processed within 1 working day. You&apos;ll receive a tracking number once your order has been
        dispatched — track it any time via our Track Your Order page.
      </p>

      <h2>Missed or delayed deliveries</h2>
      <p>
        If your order hasn&apos;t arrived within the expected window, contact us and we&apos;ll investigate with our
        courier.
      </p>
    </LegalPageLayout>
  );
}
