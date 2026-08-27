import "server-only";
import type { Product as DbProduct, Variant as DbVariant, ProductImage, Category as DbCategory } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { resolveVariantCompareAt, resolveVariantPrice, availableStock, isVariantLowStock } from "./inventory";
import type { PublicProduct, Variant, ImageRef, Category } from "./schema";

export { isVariantLowStock as isLowStock, isVariantSoldOut as isSoldOut } from "./inventory";

type DbProductWithRelations = DbProduct & {
  images: ProductImage[];
  variants: DbVariant[];
  category: DbCategory;
};

function parseJsonArray<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toImageRef(image: ProductImage | undefined, fallbackAlt: string): ImageRef {
  if (!image) return { src: "", alt: fallbackAlt, isPlaceholder: true };
  return { src: image.url, alt: image.alt, isPlaceholder: false };
}

function toPublicVariant(product: DbProduct, variant: DbVariant): Variant {
  const priceInPence = resolveVariantPrice(product.priceInPence, variant) ?? 0;
  const compareAtPriceInPence = resolveVariantCompareAt(product.priceInPence, product.compareAtPriceInPence, variant) ?? undefined;

  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    fragrance: variant.fragrance,
    tanStrength: variant.tanStrength,
    priceInPence,
    compareAtPriceInPence,
    // Public "stockQuantity" is what's actually purchasable right now
    // (raw stock minus anything reserved by in-progress checkouts).
    stockQuantity: availableStock(variant),
    lowStockThreshold: variant.lowStockThreshold,
    weightGrams: variant.weightGrams,
    imageUrl: variant.imageUrl,
    ingredients: variant.ingredients ? parseJsonArray<string[]>(variant.ingredients, []) : parseJsonArray<string[]>(product.ingredients, []),
    active: variant.active,
  };
}

function toPublicProduct(product: DbProductWithRelations): PublicProduct {
  const activeVariants = product.variants.filter((v) => v.active);
  const publicVariants = activeVariants.map((v) => toPublicVariant(product, v));

  const resolvedPrices = publicVariants.map((v) => v.priceInPence).filter((p) => p > 0);
  const priceInPence = product.priceInPence ?? (resolvedPrices.length > 0 ? Math.min(...resolvedPrices) : 0);
  const priceVariesByVariant = product.priceInPence == null && new Set(resolvedPrices).size > 1;

  const featuredImage = product.images.find((i) => i.isFeatured) ?? product.images[0];
  const gallery = product.images.filter((i) => i.id !== featuredImage?.id).map((i) => toImageRef(i, product.name));

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.category.slug,
    status: product.status.toLowerCase() as PublicProduct["status"],
    featured: product.featured,
    shortDescription: product.shortDescription,
    description: product.description,
    priceInPence,
    compareAtPriceInPence: product.compareAtPriceInPence ?? undefined,
    priceVariesByVariant,
    primaryImage: toImageRef(featuredImage, product.name),
    gallery,
    benefits: parseJsonArray(product.benefits, []),
    preparation: parseJsonArray(product.preparation, []),
    directions: parseJsonArray(product.directions, []),
    warnings: parseJsonArray(product.warnings, []),
    ingredients: parseJsonArray(product.ingredients, []),
    faqs: parseJsonArray(product.faqs, []),
    variants: publicVariants,
    defaultVariant: publicVariants[0] ?? null,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: { createdAt: "asc" as const } },
  category: true,
};

export async function getAllProducts(): Promise<PublicProduct[]> {
  const products = await prisma.product.findMany({ where: { status: "ACTIVE" }, include: productInclude });
  return products.map(toPublicProduct);
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | undefined> {
  const product = await prisma.product.findFirst({ where: { slug, status: "ACTIVE" }, include: productInclude });
  return product ? toPublicProduct(product) : undefined;
}

export async function getProductsByCategory(categorySlug: string): Promise<PublicProduct[]> {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", category: { slug: categorySlug } },
    include: productInclude,
  });
  return products.map(toPublicProduct);
}

export async function getFeaturedProducts(): Promise<PublicProduct[]> {
  const products = await prisma.product.findMany({ where: { status: "ACTIVE", featured: true }, include: productInclude });
  return products.map(toPublicProduct);
}

export async function getHeroProduct(): Promise<PublicProduct | undefined> {
  const featured = await getFeaturedProducts();
  return featured[0] ?? (await getAllProducts())[0];
}

/** Other active products in the same category — a zero-config stand-in until curated relations exist. */
export async function getRelatedProducts(slug: string): Promise<PublicProduct[]> {
  const product = await prisma.product.findFirst({ where: { slug }, include: { category: true } });
  if (!product) return [];
  const related = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId: product.categoryId, slug: { not: slug } },
    include: productInclude,
    take: 4,
  });
  return related.map(toPublicProduct);
}

export async function getCrossSells(slug: string): Promise<PublicProduct[]> {
  const product = await prisma.product.findFirst({ where: { slug } });
  if (!product) return [];
  const crossSells = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId: { not: product.categoryId } },
    include: productInclude,
    take: 3,
  });
  return crossSells.map(toPublicProduct);
}

export async function getProductsBySlugs(slugs: string[]): Promise<PublicProduct[]> {
  const products = await prisma.product.findMany({ where: { status: "ACTIVE", slug: { in: slugs } }, include: productInclude });
  return products.map(toPublicProduct);
}

export async function getAllCategoriesFromDb(): Promise<Category[]> {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description }));
}
