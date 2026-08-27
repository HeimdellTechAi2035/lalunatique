import Link from "next/link";
import type { PublicProduct } from "@/lib/products/schema";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";

export function FeaturedProducts({ products }: { products: PublicProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Featured" title="Best sellers" />
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/shop">Shop all products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
