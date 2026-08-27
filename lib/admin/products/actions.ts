"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { adjustStock } from "@/lib/products/inventory";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  ProductFormSchema,
  VariantFormSchema,
  StockAdjustmentSchema,
  ImageFormSchema,
  canActivate,
} from "./validation";

type ActionResult = { ok: true } | { ok: false; errors: string[] };

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authorized");
  }
}

function toJson(value: unknown): string {
  return JSON.stringify(value ?? []);
}

export async function createProduct(input: unknown): Promise<ActionResult | { ok: true; id: string }> {
  await requireAdmin();
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  const v = parsed.data;

  if (v.status === "ACTIVE" && !canActivate(v, false)) {
    return { ok: false, errors: ["Cannot publish as Active without a price. Set a price or save as Draft."] };
  }

  const existing = await prisma.product.findUnique({ where: { slug: v.slug } });
  if (existing) return { ok: false, errors: ["A product with this slug already exists."] };

  const product = await prisma.product.create({
    data: {
      name: v.name,
      slug: v.slug,
      categoryId: v.categoryId,
      status: v.status,
      featured: v.featured,
      priceInPence: v.priceInPence,
      compareAtPriceInPence: v.compareAtPriceInPence,
      shortDescription: v.shortDescription,
      description: v.description,
      benefits: toJson(v.benefits),
      preparation: toJson(v.preparation),
      directions: toJson(v.directions),
      warnings: toJson(v.warnings),
      ingredients: toJson(v.ingredients),
      faqs: toJson(v.faqs),
      seoTitle: v.seoTitle,
      seoDescription: v.seoDescription,
      contentVerified: v.contentVerified,
      adminNotes: v.adminNotes,
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  const v = parsed.data;

  if (v.status === "ACTIVE") {
    const variants = await prisma.variant.findMany({ where: { productId: id, active: true } });
    const hasVariantPricing = variants.some((variant) => variant.priceOverrideInPence != null);
    if (!canActivate(v, hasVariantPricing)) {
      return { ok: false, errors: ["Cannot publish as Active without a price. Set a base price, a variant price, or save as Draft."] };
    }
  }

  const slugTaken = await prisma.product.findFirst({ where: { slug: v.slug, id: { not: id } } });
  if (slugTaken) return { ok: false, errors: ["Another product already uses this slug."] };

  await prisma.product.update({
    where: { id },
    data: {
      name: v.name,
      slug: v.slug,
      categoryId: v.categoryId,
      status: v.status,
      featured: v.featured,
      priceInPence: v.priceInPence,
      compareAtPriceInPence: v.compareAtPriceInPence,
      shortDescription: v.shortDescription,
      description: v.description,
      benefits: toJson(v.benefits),
      preparation: toJson(v.preparation),
      directions: toJson(v.directions),
      warnings: toJson(v.warnings),
      ingredients: toJson(v.ingredients),
      faqs: toJson(v.faqs),
      seoTitle: v.seoTitle,
      seoDescription: v.seoDescription,
      contentVerified: v.contentVerified,
      adminNotes: v.adminNotes,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/products/${v.slug}`);
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true };
}

export async function archiveProduct(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function createVariant(productId: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = VariantFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  const v = parsed.data;

  const skuTaken = await prisma.variant.findUnique({ where: { sku: v.sku } });
  if (skuTaken) return { ok: false, errors: ["This SKU is already in use."] };

  await prisma.variant.create({
    data: {
      productId,
      sku: v.sku,
      size: v.size,
      fragrance: v.fragrance,
      tanStrength: v.tanStrength,
      priceOverrideInPence: v.priceOverrideInPence,
      salePriceInPence: v.salePriceInPence,
      saleStartsAt: v.saleStartsAt,
      saleEndsAt: v.saleEndsAt,
      lowStockThreshold: v.lowStockThreshold,
      weightGrams: v.weightGrams,
      barcode: v.barcode,
      imageUrl: v.imageUrl,
      ingredients: v.ingredients ? toJson(v.ingredients) : null,
      active: v.active,
      stockQuantity: 0,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

export async function updateVariant(variantId: string, productId: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = VariantFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  const v = parsed.data;

  const skuTaken = await prisma.variant.findFirst({ where: { sku: v.sku, id: { not: variantId } } });
  if (skuTaken) return { ok: false, errors: ["This SKU is already in use."] };

  await prisma.variant.update({
    where: { id: variantId },
    data: {
      sku: v.sku,
      size: v.size,
      fragrance: v.fragrance,
      tanStrength: v.tanStrength,
      priceOverrideInPence: v.priceOverrideInPence,
      salePriceInPence: v.salePriceInPence,
      saleStartsAt: v.saleStartsAt,
      saleEndsAt: v.saleEndsAt,
      lowStockThreshold: v.lowStockThreshold,
      weightGrams: v.weightGrams,
      barcode: v.barcode,
      imageUrl: v.imageUrl,
      ingredients: v.ingredients ? toJson(v.ingredients) : null,
      active: v.active,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteVariant(variantId: string, productId: string): Promise<void> {
  await requireAdmin();
  await prisma.variant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function adjustVariantStock(productId: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = StockAdjustmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  const { variantId, delta, reason, note } = parsed.data;

  try {
    await adjustStock(variantId, delta, reason, note);
  } catch (e) {
    return { ok: false, errors: [e instanceof Error ? e.message : "Could not adjust stock."] };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { ok: true };
}

export async function addProductImage(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = ImageFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  const { productId, url, alt } = parsed.data;

  const existingCount = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: { productId, url, alt, isFeatured: existingCount === 0, sortOrder: existingCount },
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { ok: true };
}

export async function removeProductImage(imageId: string, productId: string): Promise<void> {
  await requireAdmin();
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function setFeaturedImage(imageId: string, productId: string): Promise<void> {
  await requireAdmin();
  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isFeatured: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isFeatured: true } }),
  ]);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

const CategoryFormSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string(),
});

export async function createCategory(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = CategoryFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { ok: false, errors: ["A category with this slug already exists."] };

  const count = await prisma.category.count();
  await prisma.category.create({ data: { ...parsed.data, sortOrder: count } });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { ok: true };
}
