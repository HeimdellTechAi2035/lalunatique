import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { faqSections, faqItems } from "@/lib/content/faq";
import { safeJsonLd } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about applying, caring for and choosing La Lunatique self-tan, plus delivery and orders.",
};

export default function FaqPage() {
  const faqPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqPageJsonLd) }} />

      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <SectionHeading eyebrow="Support" title="Frequently asked questions" className="mt-6" />

      <div className="mt-10 space-y-10">
        {faqSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
            <div className="mt-3">
              <FaqAccordion items={section.items} idPrefix={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
