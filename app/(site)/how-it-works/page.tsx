import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { HowItWorks } from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How to prep, apply and maintain your La Lunatique tan for the best results.",
};

export default function HowItWorksPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "How It Works" }]} />
        <SectionHeading eyebrow="Getting the Best Results" title="How it works" className="mt-6" />
      </div>
      <HowItWorks />
    </div>
  );
}
