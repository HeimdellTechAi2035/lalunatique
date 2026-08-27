import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE_NAME}, a UK tanning and beauty brand.`,
};

/**
 * Placeholder brand story — no origin story, formulation, or ethical
 * claims (vegan/cruelty-free/etc.) have been supplied by the client
 * yet, so none are asserted here. Replace with real brand copy once
 * confirmed.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "About" }]} />
      <SectionHeading eyebrow="Our Story" title={`About ${SITE_NAME}`} className="mt-6" />
      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-sm leading-relaxed text-muted">
        <p>
          {SITE_NAME} is a UK tanning and beauty brand, offering a growing range of tanning mousse, mist and
          preparation products.
        </p>
        <p>
          We&apos;re a UK-based team, and we ship across the UK. If you have any questions about our products or
          your order, our{" "}
          <a href="/contact" className="text-accent underline">
            customer service team
          </a>{" "}
          is always happy to help.
        </p>
      </div>
    </div>
  );
}
