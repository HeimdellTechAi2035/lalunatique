import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { faqItems } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about La Lunatique products, delivery, and orders.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <SectionHeading eyebrow="Support" title="Frequently asked questions" className="mt-6" />
      <div className="mt-8">
        <FaqAccordion items={faqItems} idPrefix="faq-page" />
      </div>
    </div>
  );
}
