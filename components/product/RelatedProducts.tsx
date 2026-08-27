import type { PublicProduct } from "@/lib/products/schema";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductGrid } from "./ProductGrid";

export function RelatedProducts({ title, products }: { title: string; products: PublicProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-16">
      <SectionHeading title={title} className="mb-6" />
      <ProductGrid products={products} />
    </section>
  );
}
