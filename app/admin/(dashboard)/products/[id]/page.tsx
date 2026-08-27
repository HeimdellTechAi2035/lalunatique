import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getProductForAdmin } from "@/lib/admin/products/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantsManager } from "@/components/admin/VariantsManager";
import { ImagesManager } from "@/components/admin/ImagesManager";
import { archiveProduct } from "@/lib/admin/products/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Edit Product", robots: { index: false, follow: false } };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductForAdmin(id),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-xs text-muted hover:underline">
            ← All products
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-ink">{product.name}</h1>
        </div>
        {product.status !== "ARCHIVED" ? (
          <form
            action={async () => {
              "use server";
              await archiveProduct(id);
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Archive product
            </Button>
          </form>
        ) : null}
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Product details</h2>
        <div className="mt-4">
          <ProductForm
            categories={categories}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              categoryId: product.categoryId,
              status: product.status,
              featured: product.featured,
              priceInPence: product.priceInPence,
              compareAtPriceInPence: product.compareAtPriceInPence,
              shortDescription: product.shortDescription,
              description: product.description,
              benefits: JSON.parse(product.benefits),
              preparation: JSON.parse(product.preparation),
              directions: JSON.parse(product.directions),
              warnings: JSON.parse(product.warnings),
              ingredients: JSON.parse(product.ingredients),
              faqs: JSON.parse(product.faqs),
              seoTitle: product.seoTitle,
              seoDescription: product.seoDescription,
              contentVerified: product.contentVerified,
              adminNotes: product.adminNotes,
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Variants & stock</h2>
        <div className="mt-4">
          <VariantsManager productId={product.id} variants={product.variants} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Images</h2>
        <div className="mt-4">
          <ImagesManager productId={product.id} images={product.images} />
        </div>
      </section>
    </div>
  );
}
