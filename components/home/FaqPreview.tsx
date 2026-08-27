import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Button } from "@/components/ui/button";
import { faqItems } from "@/lib/content/faq";

export function FaqPreview() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Questions" title="Frequently asked questions" />
        <div className="mt-8">
          <FaqAccordion items={faqItems.slice(0, 4)} idPrefix="home-faq" />
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/faq">View all FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
