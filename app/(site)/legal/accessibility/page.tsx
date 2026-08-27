import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Accessibility Statement" };

export default function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility Statement" lastUpdated="25 August 2026">
      <p>
        {SITE_NAME} is committed to making this website accessible to as many people as possible, including
        those using assistive technology.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>Semantic HTML and landmark regions throughout the site</li>
        <li>Keyboard-accessible navigation, basket, and checkout</li>
        <li>Visible focus states and skip-to-content link</li>
        <li>Descriptive alt text on images, including placeholder imagery</li>
      </ul>

      <h2>Known limitations</h2>
      <p>
        This site is under active development. If you encounter an accessibility barrier, please let us know at{" "}
        {CONTACT_EMAIL} so we can address it.
      </p>
    </LegalPageLayout>
  );
}
