import { BundleSchema, type Bundle } from "./schema";

/**
 * No bundles are confirmed yet — real bundle products/component-stock
 * rules are built in a later stage (see project roadmap: bundles &
 * promotions). Kept as a real, empty, schema-validated list so callers
 * (BundlesSection, the checkout pricing seam's bundle-discount pass)
 * degrade gracefully rather than needing special-casing.
 */
const rawBundles: Bundle[] = [];

export const bundles = BundleSchema.array().parse(rawBundles);

export function getAllBundles(): Bundle[] {
  return bundles;
}

export function getBundleBySlug(slug: string): Bundle | undefined {
  return bundles.find((b) => b.slug === slug);
}

export function getBundleForProduct(bundleId: string | undefined): Bundle | undefined {
  if (!bundleId) return undefined;
  return bundles.find((b) => b.id === bundleId);
}
