"use server";

import { getProductBySlug } from "@/lib/products/queries";
import { getAllBundles } from "@/lib/products/bundles";
import { calculateShippingInPence, SHIPPING_METHODS } from "@/lib/shipping/rules";
import { CalculateTotalsInputSchema, type CartLineInput } from "./schema";
import { resolvePromoDiscountInPence } from "./promo";

/**
 * Bundle pricing is applied automatically, not chosen by the client: if
 * every product in a bundle is present in the basket (qty >= 1 each),
 * one set of those items is repriced at the bundle price. This runs
 * server-side against the resolved lines, so it can't be spoofed by
 * requesting a bundle discount without the qualifying products.
 */
function applyBundleDiscounts(lines: OrderTotals["lines"]): { discountInPence: number; labels: string[] } {
  let discountInPence = 0;
  const labels: string[] = [];

  for (const bundle of getAllBundles()) {
    const memberLines = bundle.productSlugs.map((slug) => lines.find((l) => l.slug === slug));
    const qualifies = memberLines.every((l) => l && l.qty >= 1);
    if (!qualifies) continue;

    const componentSum = memberLines.reduce((sum, l) => sum + (l?.unitPriceInPence ?? 0), 0);
    const saving = componentSum - bundle.bundlePriceInPence;
    if (saving > 0) {
      discountInPence += saving;
      labels.push(`${bundle.name} bundle savings`);
    }
  }

  return { discountInPence, labels };
}

export type OrderTotals = {
  lines: {
    slug: string;
    variantId?: string;
    variantSku?: string;
    /** Combined display label, e.g. "Tanning Mousse — Coconut". */
    name: string;
    /** Product name alone, without the variant suffix. */
    productName: string;
    variantLabel?: string;
    unitPriceInPence: number;
    qty: number;
    lineTotalInPence: number;
    image: { src: string; alt: string; isPlaceholder: boolean };
  }[];
  subtotalInPence: number;
  discountInPence: number;
  bundleSavingsLabels: string[];
  shippingInPence: number;
  totalInPence: number;
  shippingMethodLabel: string;
  freeDeliveryEligible: boolean;
  errors: string[];
};

/**
 * The single authoritative source of truth for what an order costs.
 * Takes only product references + quantities — there is no price
 * parameter in this signature, so a tampered client value has nowhere
 * to enter. Every price is resolved fresh from the trusted product
 * data layer (lib/products/queries.ts) on every call.
 */
export async function calculateOrderTotals(input: {
  lines: CartLineInput[];
  shippingMethodId: "standard" | "express";
  promoCode?: string;
}): Promise<OrderTotals> {
  const parsed = CalculateTotalsInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      lines: [],
      subtotalInPence: 0,
      discountInPence: 0,
      bundleSavingsLabels: [],
      shippingInPence: 0,
      totalInPence: 0,
      shippingMethodLabel: "",
      freeDeliveryEligible: false,
      errors: ["Invalid checkout data."],
    };
  }

  const errors: string[] = [];
  const resolvedLines: OrderTotals["lines"] = [];

  for (const line of parsed.data.lines) {
    const product = await getProductBySlug(line.slug);
    if (!product) {
      errors.push(`"${line.slug}" is no longer available and was removed from your basket.`);
      continue;
    }

    const variant = (line.variantId ? product.variants.find((v) => v.id === line.variantId) : undefined) ?? product.defaultVariant;
    if (!variant) {
      errors.push(`"${product.name}" is no longer available and was removed from your basket.`);
      continue;
    }

    const qty = Math.min(line.qty, variant.stockQuantity);
    if (qty < line.qty) {
      errors.push(
        qty === 0
          ? `"${product.name}" is currently sold out and was removed from your basket.`
          : `Only ${qty} of "${product.name}" is in stock — quantity was adjusted.`,
      );
    }
    if (qty <= 0) continue;

    const variantLabel = [variant.fragrance, variant.size, variant.tanStrength].filter(Boolean).join(", ") || undefined;

    resolvedLines.push({
      slug: product.slug,
      variantId: variant.id,
      variantSku: variant.sku,
      name: variantLabel ? `${product.name} — ${variantLabel}` : product.name,
      productName: product.name,
      variantLabel,
      unitPriceInPence: variant.priceInPence,
      qty,
      lineTotalInPence: variant.priceInPence * qty,
      image: product.primaryImage,
    });
  }

  const subtotalInPence = resolvedLines.reduce((sum, l) => sum + l.lineTotalInPence, 0);
  const promoDiscountInPence = resolvePromoDiscountInPence(parsed.data.promoCode, subtotalInPence);
  const { discountInPence: bundleDiscountInPence, labels: bundleSavingsLabels } = applyBundleDiscounts(resolvedLines);
  const discountInPence = promoDiscountInPence + bundleDiscountInPence;
  const discountedSubtotal = subtotalInPence - discountInPence;
  const shippingInPence = subtotalInPence > 0 ? calculateShippingInPence(discountedSubtotal, parsed.data.shippingMethodId) : 0;
  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === parsed.data.shippingMethodId);

  if (parsed.data.promoCode && promoDiscountInPence === 0) {
    errors.push(`Promo code "${parsed.data.promoCode}" is not valid.`);
  }

  return {
    lines: resolvedLines,
    subtotalInPence,
    discountInPence,
    bundleSavingsLabels,
    shippingInPence,
    totalInPence: discountedSubtotal + shippingInPence,
    shippingMethodLabel: shippingMethod ? `${shippingMethod.label} (${shippingMethod.etaLabel})` : "",
    freeDeliveryEligible: shippingInPence === 0 && parsed.data.shippingMethodId === "standard",
    errors,
  };
}
