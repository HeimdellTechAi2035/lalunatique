import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="25 August 2026">
      <p>This policy explains how {SITE_NAME} uses cookies and similar technologies on this website.</p>

      <h2>Essential cookies</h2>
      <p>
        These are required for the site to function — for example, remembering the contents of your basket and
        your cookie consent choice. They cannot be switched off.
      </p>

      <h2>Optional cookies</h2>
      <p>
        With your consent, we may use optional cookies for analytics (to understand how the site is used) and
        marketing (to measure the effectiveness of campaigns). No optional tracking is active until you consent.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can change your cookie preferences at any time via your browser settings, or by clearing this site&apos;s
        local storage.
      </p>
    </LegalPageLayout>
  );
}
