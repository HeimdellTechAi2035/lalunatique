import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products/queries";
import { ProductCatalogProvider } from "@/components/providers/ProductCatalogProvider";
import { CartProvider } from "@/lib/cart/context";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/utils/constants";
import { safeJsonLd } from "@/lib/utils/format";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  // Populated once a real Search Console verification code exists (see
  // GOOGLE_SITE_VERIFICATION in .env.local.example) — renders nothing
  // until then, rather than an empty/broken meta tag.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const products = await getAllProducts();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Site-wide identity markup — for normal rich-results eligibility, not
  // an "AI citation" mechanism (Google's own generative-AI optimization
  // guide is explicit that structured data isn't required for that; see
  // lib/knowledge/README for the fuller reasoning). Only fields we can
  // actually stand behind — no invented founding date, address, or
  // social profiles.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}/brand/la-lunatique-logo.jpg`,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
  };

  return (
    <html lang="en-GB">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }} />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ProductCatalogProvider products={products}>
          <CartProvider>{children}</CartProvider>
        </ProductCatalogProvider>
      </body>
    </html>
  );
}
