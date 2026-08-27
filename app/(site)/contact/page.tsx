import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";
import { CONTACT_EMAIL } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the La Lunatique customer service team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <SectionHeading
        eyebrow="Get in Touch"
        title="Contact us"
        description={`Prefer email? Reach us directly at ${CONTACT_EMAIL}.`}
        className="mt-6"
      />
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
