import { z } from "zod";

export const ProductStatusSchema = z.enum(["draft", "active", "archived", "coming_soon"]);
export type ProductStatusValue = z.infer<typeof ProductStatusSchema>;

export const ImageRefSchema = z.object({
  /** Path under /public, or a data URI for generated placeholder art. */
  src: z.string(),
  alt: z.string(),
  /** True when `src` points at a styled placeholder, not real photography. */
  isPlaceholder: z.boolean(),
});
export type ImageRef = z.infer<typeof ImageRefSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const FaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type ProductFaq = z.infer<typeof FaqSchema>;

/**
 * Customer-facing variant shape. Note there is no `costPriceInPence`
 * here and no admin-only fields — see queries.ts for the internal ->
 * public projection.
 */
export const VariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  size: z.string().nullable(),
  fragrance: z.string().nullable(),
  tanStrength: z.string().nullable(),
  /** Resolved selling price for this specific variant (override or inherited base price). */
  priceInPence: z.number().int().positive(),
  /** Resolved compare-at price for this variant, if on sale. */
  compareAtPriceInPence: z.number().int().positive().optional(),
  stockQuantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  weightGrams: z.number().int().nonnegative(),
  imageUrl: z.string().nullable(),
  /** Falls back to the product's ingredients when a variant has none of its own. */
  ingredients: z.array(z.string()),
  active: z.boolean(),
});
export type Variant = z.infer<typeof VariantSchema>;

/**
 * Client/customer-safe product projection — the shape every page/
 * component uses. Sourced from lib/products/queries.ts only; never
 * includes internal fields like adminNotes/contentVerified.
 */
export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  categorySlug: z.string(),
  status: ProductStatusSchema,
  featured: z.boolean(),
  shortDescription: z.string(),
  description: z.string(),
  /** Resolved "from" price — the product's base price, or the lowest variant price when the base price is unset. */
  priceInPence: z.number().int().positive(),
  compareAtPriceInPence: z.number().int().positive().optional(),
  /** True when priceInPence varies by variant (show "From £X" rather than a flat price). */
  priceVariesByVariant: z.boolean(),
  primaryImage: ImageRefSchema,
  gallery: z.array(ImageRefSchema),
  benefits: z.array(z.string()),
  preparation: z.array(z.string()),
  directions: z.array(z.string()),
  warnings: z.array(z.string()),
  ingredients: z.array(z.string()),
  faqs: z.array(FaqSchema),
  variants: z.array(VariantSchema),
  /** First active/purchasable variant — used as the default selection until a customer picks otherwise. */
  defaultVariant: VariantSchema.nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});
export type Product = z.infer<typeof ProductSchema>;
export type PublicProduct = Product;

export const BundleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  productSlugs: z.array(z.string()).min(2),
  bundlePriceInPence: z.number().int().positive(),
  primaryImage: ImageRefSchema,
});
export type Bundle = z.infer<typeof BundleSchema>;
