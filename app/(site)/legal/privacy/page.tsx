import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="25 August 2026">
      <p>
        This policy explains how {SITE_NAME} collects, uses and protects your personal data in accordance with UK
        GDPR and the Data Protection Act 2018.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Contact details (name, email, delivery address, phone number)</li>
        <li>Order and payment history (not including full card numbers, which we never store)</li>
        <li>Account details, if you create an account</li>
        <li>Marketing preferences and communications</li>
        <li>Website usage data, where analytics are enabled with your consent</li>
      </ul>

      <h2>How we use your data</h2>
      <p>To process orders, provide customer service, and — with your consent — send marketing communications.</p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, delete, or export your personal data, and to withdraw marketing
        consent at any time. Contact us at {CONTACT_EMAIL} to exercise these rights.
      </p>

      <h2>Data retention</h2>
      <p>We retain personal data only as long as necessary for the purposes it was collected for, or as required by law.</p>

      <h2>Third parties</h2>
      <p>
        We share data only with service providers necessary to fulfil orders (e.g. payment processors, couriers),
        who are contractually required to protect it.
      </p>
    </LegalPageLayout>
  );
}
