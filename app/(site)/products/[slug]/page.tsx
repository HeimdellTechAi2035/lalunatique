import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getCrossSells,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/queries";
import { getAverageRating, getReviewsForProduct } from "@/lib/reviews/mock-data";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { StockBadge } from "@/components/product/StockBadge";
import { AddToBasketControl } from "@/components/product/AddToBasketControl";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ReviewsList } from "@/components/product/ReviewsList";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { FrequentlyBoughtTogether } from "@/components/product/FrequentlyBoughtTogether";
import { getCategoryBySlug } from "@/lib/products/categories";
import { safeJsonLd } from "@/lib/utils/format";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription,
    openGraph: { images: product.primaryImage.isPlaceholder ? [] : [product.primaryImage.src] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [category, related, crossSells] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getRelatedProducts(product.slug),
    getCrossSells(product.slug),
  ]);
  const reviews = getReviewsForProduct(product.slug);
  const averageRating = getAverageRating(product.slug);
  const variant = product.defaultVariant;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: variant?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: (product.priceInPence / 100).toFixed(2),
      availability: variant && variant.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          ...(category ? [{ label: category.name, href: `/shop/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={[product.primaryImage, ...product.gallery]} productName={product.name} />

        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">{product.shortDescription}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex items-baseline gap-1">
              {product.priceVariesByVariant ? <span className="text-sm text-muted">From</span> : null}
              <PriceDisplay priceInPence={variant?.priceInPence ?? product.priceInPence} compareAtPriceInPence={variant?.compareAtPriceInPence ?? product.compareAtPriceInPence} size="lg" />
            </span>
            <StockBadge variant={variant} />
          </div>

          {averageRating ? (
            <p className="mt-2 text-xs text-muted">
              {averageRating.toFixed(1)} / 5 · {reviews.length} sample reviews
            </p>
          ) : null}

          <div className="mt-6">
            <AddToBasketControl product={product} variant={variant} />
          </div>

          <div className="mt-6">
            <TrustBadges />
          </div>
        </div>
      </div>

      <ProductTabs product={product} ingredients={variant?.ingredients ?? product.ingredients} />
      <ReviewsList reviews={reviews} averageRating={averageRating} />
      <FrequentlyBoughtTogether baseProduct={product} crossSells={crossSells} />
      <RelatedProducts title="You may also like" products={related} />
    </div>
  );
}
