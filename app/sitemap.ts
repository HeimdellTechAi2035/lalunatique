import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products/queries";
import { getAllCategories } from "@/lib/products/categories";

const staticRoutes = [
  "",
  "/shop",
  "/about",
  "/how-it-works",
  "/pricing",
  "/consultation",
  "/faq",
  "/contact",
  "/track-order",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/legal/delivery",
  "/legal/returns-refunds",
  "/legal/cancellation",
  "/legal/complaints",
  "/legal/payment",
  "/legal/website-terms",
  "/legal/accessibility",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  return [
    ...staticRoutes.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() })),
    ...categories.map((c) => ({ url: `${baseUrl}/shop/${c.slug}`, lastModified: new Date() })),
    ...products.map((p) => ({ url: `${baseUrl}/products/${p.slug}`, lastModified: new Date() })),
  ];
}
