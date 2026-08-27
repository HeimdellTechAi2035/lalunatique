import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = { title: "Your Basket" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Basket" }]} />
      <SectionHeading eyebrow="Basket" title="Your basket" className="mt-6 mb-8" />
      <CartPageContent />
    </div>
  );
}
