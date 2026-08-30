import "server-only";
import { getAllProducts, getAllCategoriesFromDb } from "@/lib/products/queries";
import { faqSections } from "@/lib/content/faq";
import { legalLinks } from "@/components/layout/nav-links";
import { SHIPPING_METHODS } from "@/lib/shipping/methods";
import { CONTACT_EMAIL, FREE_DELIVERY_THRESHOLD_PENCE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/utils/constants";

/**
 * A single, structured representation of everything real and currently
 * true about this business — assembled live from the same data every
 * page on the site already renders from (product/category queries, the
 * FAQ content file, the legal page list, shipping constants), never
 * hand-maintained separately. That's deliberate: a second, manually
 * kept "AI knowledge base" would drift from the real site and become
 * exactly the kind of untrustworthy content an agent should learn to
 * discount. Exposed publicly at GET /api/knowledge-catalogue, and used
 * as the answer source for the A2A agent (lib/knowledge/answer.ts).
 *
 * Reviews/testimonials and call-transcript insights are deliberately
 * absent — this codebase has no real ones yet (see
 * lib/reviews/mock-data.ts, which is explicit sample-only content
 * excluded from search-facing structured data), and fabricating them
 * here would be exactly the kind of untrustworthy content this exists
 * to avoid.
 */
export type KnowledgeCatalogue = {
  generatedAt: string;
  business: {
    name: string;
    tagline: string;
    description: string;
    url: string;
    contactEmail: string;
    country: string;
  };
  servicesOffered: { name: string; slug: string; description: string; url: string; productCount: number }[];
  products: {
    name: string;
    slug: string;
    category: string;
    priceInPence: number | null;
    url: string;
    shortDescription: string;
  }[];
  pricing: {
    deliveryMethods: { label: string; etaLabel: string; priceInPence: number }[];
    freeDeliveryThresholdInPence: number;
    pricingGuideUrl: string;
  };
  policies: { title: string; url: string }[];
  faqs: { section: string; question: string; answer: string }[];
  serviceArea: { description: string };
};

export async function getKnowledgeCatalogue(): Promise<KnowledgeCatalogue> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategoriesFromDb()]);

  const servicesOffered = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    url: `${baseUrl}/shop/${category.slug}`,
    productCount: products.filter((p) => p.categorySlug === category.slug).length,
  }));

  return {
    generatedAt: new Date().toISOString(),
    business: {
      name: SITE_NAME,
      tagline: SITE_TAGLINE,
      description: SITE_DESCRIPTION,
      url: baseUrl,
      contactEmail: CONTACT_EMAIL,
      country: "United Kingdom",
    },
    servicesOffered,
    products: products.map((p) => ({
      name: p.name,
      slug: p.slug,
      category: p.categorySlug,
      priceInPence: p.priceInPence || null,
      url: `${baseUrl}/products/${p.slug}`,
      shortDescription: p.shortDescription,
    })),
    pricing: {
      deliveryMethods: SHIPPING_METHODS.map((m) => ({ label: m.label, etaLabel: m.etaLabel, priceInPence: m.basePriceInPence })),
      freeDeliveryThresholdInPence: FREE_DELIVERY_THRESHOLD_PENCE,
      pricingGuideUrl: `${baseUrl}/pricing`,
    },
    policies: legalLinks.map((link) => ({ title: link.label, url: `${baseUrl}${link.href}` })),
    faqs: faqSections.flatMap((section) => section.items.map((item) => ({ section: section.title, ...item }))),
    serviceArea: {
      description: "Delivers across the United Kingdom via Royal Mail. International shipping is planned but not yet available.",
    },
  };
}
