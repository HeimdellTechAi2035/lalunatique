import { SectionHeading } from "@/components/shared/SectionHeading";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function NewsletterSignup() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Join Us" title="Stay in the glow" description="Sign up for offers, launches and tanning tips." />
      <div className="mx-auto mt-6 max-w-sm">
        <NewsletterForm />
      </div>
    </section>
  );
}
