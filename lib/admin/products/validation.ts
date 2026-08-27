import { z } from "zod";

const statusValues = ["DRAFT", "ACTIVE", "ARCHIVED", "COMING_SOON"] as const;

/** Turns a textarea (one item per line) into a clean string[]. */
export function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Parses "Question :: Answer" per line into {question, answer}[]. */
export function linesToFaqs(value: string): { question: string; answer: string }[] {
  return linesToArray(value)
    .map((line) => {
      const [question, ...rest] = line.split("::");
      const answer = rest.join("::").trim();
      return { question: question.trim(), answer };
    })
    .filter((f) => f.question && f.answer);
}

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(statusValues),
  featured: z.boolean(),
  priceInPence: z.number().int().positive().nullable(),
  compareAtPriceInPence: z.number().int().positive().nullable(),
  shortDescription: z.string(),
  description: z.string(),
  benefits: z.array(z.string()),
  preparation: z.array(z.string()),
  directions: z.array(z.string()),
  warnings: z.array(z.string()),
  ingredients: z.array(z.string()),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  contentVerified: z.boolean(),
  adminNotes: z.string(),
});
export type ProductFormValues = z.infer<typeof ProductFormSchema>;

/**
 * A product can only go ACTIVE with real pricing information: either a
 * base price, or at least one active variant with its own price. This
 * is what stops a TBC/draft product from accidentally being purchasable.
 */
export function canActivate(values: { priceInPence: number | null }, hasVariantPricing: boolean): boolean {
  return values.priceInPence != null || hasVariantPricing;
}

export const VariantFormSchema = z
  .object({
    sku: z.string().min(1, "SKU is required"),
    size: z.string().nullable(),
    fragrance: z.string().nullable(),
    tanStrength: z.string().nullable(),
    priceOverrideInPence: z.number().int().positive().nullable(),
    salePriceInPence: z.number().int().positive().nullable(),
    saleStartsAt: z.date().nullable(),
    saleEndsAt: z.date().nullable(),
    lowStockThreshold: z.number().int().nonnegative(),
    weightGrams: z.number().int().nonnegative(),
    barcode: z.string().nullable(),
    imageUrl: z.string().nullable(),
    ingredients: z.array(z.string()).nullable(),
    active: z.boolean(),
  })
  .refine((v) => !v.saleStartsAt || !v.saleEndsAt || v.saleEndsAt > v.saleStartsAt, {
    message: "Sale end date must be after the start date",
    path: ["saleEndsAt"],
  });
export type VariantFormValues = z.infer<typeof VariantFormSchema>;

export const StockAdjustmentSchema = z.object({
  variantId: z.string().min(1),
  delta: z.number().int().refine((n) => n !== 0, "Enter a non-zero amount"),
  reason: z.enum(["MANUAL_ADJUSTMENT", "RESTOCK", "RETURN", "CORRECTION"]),
  note: z.string().optional(),
});

export const ImageFormSchema = z.object({
  productId: z.string().min(1),
  // Same-origin paths only for now (e.g. "/products/x.jpg") — external
  // hosts need next.config.ts remote-image allowlisting first, which is
  // a deliberate config decision, not something to open by default.
  url: z.string().min(1, "Image URL is required").regex(/^\//, "Use a path starting with / (external URLs need config first)"),
  alt: z.string().min(1, "Alt text is required"),
});
