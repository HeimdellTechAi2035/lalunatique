import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Complaints Procedure" };

export default function ComplaintsPage() {
  return (
    <LegalPageLayout title="Complaints Procedure" lastUpdated="25 August 2026">
      <h2>How to make a complaint</h2>
      <p>
        If you&apos;re unhappy with a product, order, or service, contact us at {CONTACT_EMAIL} or via our{" "}
        Contact page with your order number and details of the issue.
      </p>

      <h2>What happens next</h2>
      <ul>
        <li>We&apos;ll acknowledge your complaint within 2 working days</li>
        <li>We aim to fully resolve most complaints within 10 working days</li>
        <li>If we need longer, we&apos;ll keep you updated on progress</li>
      </ul>

      <h2>Alternative dispute resolution</h2>
      <p>
        If we&apos;re unable to resolve your complaint, you may be entitled to refer it to an approved Alternative
        Dispute Resolution provider.
      </p>
    </LegalPageLayout>
  );
}
