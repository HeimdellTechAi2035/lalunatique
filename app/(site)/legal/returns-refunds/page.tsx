import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Returns & Refunds" };

export default function ReturnsRefundsPage() {
  return (
    <LegalPageLayout title="Returns & Refunds" lastUpdated="25 August 2026">
      <h2>Our returns policy</h2>
      <p>
        You may return unopened, unused products within 30 days of delivery for a full refund. For hygiene
        reasons, opened tanning and skincare products can only be returned if faulty.
      </p>

      <h2>How to start a return</h2>
      <p>
        Contact us at {CONTACT_EMAIL} with your order number and the item(s) you&apos;d like to return. We&apos;ll
        confirm the next steps and a returns address.
      </p>

      <h2>Refunds</h2>
      <p>
        Once we receive and inspect your return, we&apos;ll process your refund to the original payment method
        within 14 days.
      </p>

      <h2>Faulty items</h2>
      <p>
        If an item arrives faulty or damaged, contact us as soon as possible — we&apos;ll arrange a replacement or
        refund at no cost to you.
      </p>
    </LegalPageLayout>
  );
}
