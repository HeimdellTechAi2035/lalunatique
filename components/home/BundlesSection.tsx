import type { Bundle } from "@/lib/products/schema";
import type { PublicProduct } from "@/lib/products/schema";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { AddBundleButton } from "./AddBundleButton";

export function BundlesSection({ bundles, products }: { bundles: Bundle[]; products: PublicProduct[] }) {
  if (bundles.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Save More" title="Bundle & save" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {bundles.map((bundle) => {
          const members = bundle.productSlugs
            .map((slug) => products.find((p) => p.slug === slug))
            .filter((p): p is PublicProduct => Boolean(p));
          const fullPrice = members.reduce((sum, p) => sum + p.priceInPence, 0);

          return (
            <div key={bundle.id} className="flex gap-5 rounded-lg border border-border p-5">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-cream">
                <PlaceholderImage image={bundle.primaryImage} sizes="112px" />
              </div>
              <div className="flex flex-1 flex-col">
                <h3 className="text-sm font-semibold text-ink">{bundle.name}</h3>
                <p className="mt-1 text-xs text-muted">{bundle.description}</p>
                <p className="mt-2 text-xs text-muted">Includes: {members.map((m) => m.name).join(", ")}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <PriceDisplay priceInPence={bundle.bundlePriceInPence} compareAtPriceInPence={fullPrice} size="sm" />
                  <AddBundleButton productSlugs={bundle.productSlugs} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
