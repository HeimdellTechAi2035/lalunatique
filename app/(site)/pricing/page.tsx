import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getAllCategoriesFromDb } from "@/lib/products/queries";
import { getProductsByCategory } from "@/lib/products/queries";
import { SHIPPING_METHODS } from "@/lib/shipping/methods";
import { FREE_DELIVERY_THRESHOLD_PENCE } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Pricing Guide",
  description: "How La Lunatique self-tan is priced by product type, plus current delivery costs.",
};

/**
 * Price ranges here are computed live from the actual product catalogue
 * on every request, not hardcoded — so this page can never quietly go
 * stale or overstate a price the store isn't actually charging.
 */
export default async function PricingGuidePage() {
  const categories = await getAllCategoriesFromDb();
  const categoryPricing = await Promise.all(
    categories.map(async (category) => {
      const products = await getProductsByCategory(category.slug);
      const prices = products.map((p) => p.priceInPence).filter((p) => p > 0);
      return {
        category,
        productCount: products.length,
        minPriceInPence: prices.length > 0 ? Math.min(...prices) : null,
        maxPriceInPence: prices.length > 0 ? Math.max(...prices) : null,
      };
    }),
  );
  const visibleCategories = categoryPricing.filter((c) => c.productCount > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Pricing Guide" }]} />
      <SectionHeading eyebrow="Buying Guide" title="How our pricing works" className="mt-6" />

      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-sm leading-relaxed text-muted">
        <p>
          Every product is priced individually, based on formula and pack size — there&apos;s no membership fee or
          subscription required to buy at these prices. The price shown on each product page, and at checkout, is
          always the exact amount you&apos;ll pay: it&apos;s resolved from our live catalogue at the moment you
          check out, never estimated or rounded up.
        </p>
      </div>

      {visibleCategories.length > 0 ? (
        <div className="mt-10 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-cream text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Price range</th>
              </tr>
            </thead>
            <tbody>
              {visibleCategories.map(({ category, productCount, minPriceInPence, maxPriceInPence }) => (
                <tr key={category.slug} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link href={`/shop/${category.slug}`} className="font-medium text-ink hover:text-accent">
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{productCount}</td>
                  <td className="px-4 py-3 text-ink">
                    {minPriceInPence != null && maxPriceInPence != null
                      ? minPriceInPence === maxPriceInPence
                        ? formatPrice(minPriceInPence)
                        : `${formatPrice(minPriceInPence)} – ${formatPrice(maxPriceInPence)}`
                      : "Price TBC"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="prose prose-neutral mt-10 max-w-none space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="text-base font-semibold text-ink">Delivery costs</h2>
        <ul className="list-disc space-y-1 pl-5">
          {SHIPPING_METHODS.map((method) => (
            <li key={method.id}>
              {method.label} ({method.etaLabel}): {formatPrice(method.basePriceInPence)}
            </li>
          ))}
        </ul>
        <p>
          Standard delivery is free once your basket total reaches {formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)} —
          this is calculated automatically at checkout, so you&apos;ll always see it applied before you pay.
        </p>

        <h2 className="text-base font-semibold text-ink">Choosing by budget</h2>
        <p>
          If you want to try a lighter, more gradual tan first, tanning drops mixed into your own moisturiser are
          usually the most cost-effective way to start, since one bottle stretches across many applications. For a
          single-product, more traditional application, mousse and mist are priced per bottle as shown above. See
          our{" "}
          <Link href="/faq" className="text-accent underline">
            FAQ
          </Link>{" "}
          for guidance on choosing between them.
        </p>
      </div>
    </div>
  );
}
