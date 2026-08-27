import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getProductsByCategory } from "@/lib/products/queries";
import { getAllCategories, getCategoryBySlug } from "@/lib/products/categories";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function ShopCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([getProductsByCategory(category.slug), getAllCategories()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />
      <SectionHeading eyebrow="Shop" title={category.name} description={category.description} className="mt-6 mb-8" />
      <ShopBrowser products={products} categories={categories} activeCategorySlug={category.slug} />
    </div>
  );
}
