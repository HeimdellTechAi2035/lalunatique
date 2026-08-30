import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CONTACT_EMAIL } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description: "Book a free shade-matching consultation with La Lunatique.",
};

/**
 * Uses Google Calendar's own "Appointment schedule" feature — a
 * shareable booking page Google Calendar generates natively — rather
 * than a custom Calendar API/OAuth integration. Simpler, needs no
 * credentials in this codebase, and works with a free Google account.
 * Set NEXT_PUBLIC_BOOKING_URL once that schedule exists; until then
 * this page degrades to a plain contact prompt instead of an empty or
 * broken embed.
 */
export default function ConsultationPage() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Book a Consultation" }]} />
      <SectionHeading
        eyebrow="Consultation"
        title="Book a free shade-matching consultation"
        description="Not sure which product or shade is right for you? Book a short call and we'll help you choose."
        className="mt-6"
      />

      <div className="mt-8">
        {bookingUrl ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              src={bookingUrl}
              title="Book a consultation"
              className="h-[720px] w-full"
              frameBorder={0}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-cream p-8 text-center text-sm text-muted">
            <p>Online booking isn&apos;t connected yet.</p>
            <p className="mt-2">
              In the meantime, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline">
                {CONTACT_EMAIL}
              </a>{" "}
              and we&apos;ll arrange a time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
