import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TrackOrderForm } from "@/components/shared/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track the status of your La Lunatique order.",
};

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Track Order" }]} />
      <SectionHeading eyebrow="Order Status" title="Track your order" className="mt-6 mb-8" />
      <TrackOrderForm />
    </div>
  );
}
