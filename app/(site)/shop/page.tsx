import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getAllProducts } from "@/lib/products/queries";
import { getAllCategories } from "@/lib/products/categories";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full La Lunatique range — tanning mousse, mists, preparation and more.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <SectionHeading eyebrow="Shop" title="All products" className="mt-6 mb-8" />
      <ShopBrowser products={products} categories={categories} />
    </div>
  );
}
