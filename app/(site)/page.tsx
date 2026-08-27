import type { Metadata } from "next";
import { getAllProducts, getFeaturedProducts, getHeroProduct, getCrossSells } from "@/lib/products/queries";
import { getAllBundles } from "@/lib/products/bundles";
import { SITE_DESCRIPTION } from "@/lib/utils/constants";
import { Hero } from "@/components/home/Hero";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { ProductBenefits } from "@/components/home/ProductBenefits";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BundlesSection } from "@/components/home/BundlesSection";
import { FrequentlyBoughtTogether } from "@/components/product/FrequentlyBoughtTogether";
import { FaqPreview } from "@/components/home/FaqPreview";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { CustomerServiceCta } from "@/components/home/CustomerServiceCta";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
};

export default async function HomePage() {
  const heroProduct = await getHeroProduct();

  if (!heroProduct) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-muted">No products are published yet.</p>
      </div>
    );
  }

  const [featuredProducts, crossSells, bundles, allProducts] = await Promise.all([
    getFeaturedProducts(),
    getCrossSells(heroProduct.slug),
    Promise.resolve(getAllBundles()),
    getAllProducts(),
  ]);

  return (
    <>
      <Hero product={heroProduct} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <TrustBadges />
      </div>
      <ProductBenefits product={heroProduct} />
      <HowItWorks />
      <CustomerReviews />
      <FeaturedProducts products={featuredProducts} />
      <BundlesSection bundles={bundles} products={allProducts} />
      <FrequentlyBoughtTogether baseProduct={heroProduct} crossSells={crossSells} />
      <FaqPreview />
      <NewsletterSignup />
      <CustomerServiceCta />
    </>
  );
}
