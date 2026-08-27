import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Website Terms of Use" };

export default function WebsiteTermsPage() {
  return (
    <LegalPageLayout title="Website Terms of Use" lastUpdated="25 August 2026">
      <p>
        These terms govern your use of the {SITE_NAME} website, separate from the terms that apply when you place
        an order (see Terms & Conditions).
      </p>

      <h2>Acceptable use</h2>
      <p>
        You must not misuse this website — including attempting to gain unauthorised access, introducing malware,
        or using it in a way that disrupts other users.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this site, including text, images, logos and design, is owned by or licensed to us and may
        not be reproduced without permission.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We take care to keep information on this site accurate, but we don&apos;t guarantee it&apos;s complete or
        error-free at all times.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms from time to time. Continued use of the site means you accept any changes.</p>
    </LegalPageLayout>
  );
}
