import type { PublicProduct } from "@/lib/products/schema";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Sparkles } from "lucide-react";

export function ProductBenefits({ product }: { product: PublicProduct }) {
  if (product.benefits.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Why La Lunatique" title={`Why you'll love ${product.name}`} />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {product.benefits.map((benefit) => (
          <div key={benefit} className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center">
            <Sparkles className="h-6 w-6 text-accent" aria-hidden />
            <p className="text-sm text-ink">{benefit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
