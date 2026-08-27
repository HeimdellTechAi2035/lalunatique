import "server-only";
import { getAllProducts } from "@/lib/products/queries";
import { isInStock, isLowStock } from "@/lib/products/stock";
import { faqItems } from "@/lib/content/faq";
import {
  CONTACT_EMAIL,
  FREE_DELIVERY_THRESHOLD_PENCE,
  STANDARD_DELIVERY_PENCE,
  EXPRESS_DELIVERY_PENCE,
} from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";

export type KnowledgeEntry = {
  id: string;
  /** Words this entry should match against — not shown to the customer. */
  keywords: string[];
  /** Rendered verbatim as the bot's answer — never generated freeform. */
  answer: string;
  /** Optional link shown alongside the answer. */
  link?: { href: string; label: string };
};

/**
 * Everything the bot is allowed to say lives here, assembled fresh on
 * each request from data that's already public elsewhere on the site
 * (published FAQ, published products, real store config). Nothing is
 * invented for chat specifically — if it's not here, the bot says so
 * and points to a human, rather than guessing.
 */
export async function buildKnowledgeBase(): Promise<KnowledgeEntry[]> {
  const entries: KnowledgeEntry[] = [];

  for (const item of faqItems) {
    entries.push({
      id: `faq-${item.question}`,
      keywords: tokenize(`${item.question} ${item.answer}`),
      answer: item.answer,
    });
  }

  const products = await getAllProducts();
  for (const product of products) {
    const variant = product.defaultVariant;
    const availability = !variant
      ? "currently unavailable"
      : !isInStock(variant)
        ? "currently sold out"
        : isLowStock(variant)
          ? `in stock (only ${variant.stockQuantity} left)`
          : "in stock";

    const priceLabel = product.priceVariesByVariant
      ? `from ${formatPrice(product.priceInPence)}`
      : formatPrice(product.priceInPence);

    const benefitsLine = product.benefits.length > 0 ? ` Key points: ${product.benefits.join("; ")}.` : "";

    entries.push({
      id: `product-${product.slug}`,
      keywords: tokenize(`${product.name} ${product.categorySlug} ${product.shortDescription}`),
      answer: `${product.name} — ${priceLabel}, ${availability}. ${product.shortDescription}${benefitsLine}`,
      link: { href: `/products/${product.slug}`, label: `View ${product.name}` },
    });
  }

  entries.push(
    {
      id: "policy-delivery",
      keywords: tokenize("delivery shipping cost price how much royal mail postage dispatch"),
      answer: `We deliver within the UK via Royal Mail. Standard delivery is ${formatPrice(STANDARD_DELIVERY_PENCE)} (free on orders over ${formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)}); Express delivery is ${formatPrice(EXPRESS_DELIVERY_PENCE)}.`,
      link: { href: "/legal/delivery", label: "Delivery Information" },
    },
    {
      id: "policy-international",
      keywords: tokenize("international abroad overseas ship outside uk worldwide"),
      answer: "We currently ship within the UK. International shipping is planned for the future — check back or contact us for updates.",
      link: { href: "/contact", label: "Contact us" },
    },
    {
      id: "policy-returns",
      keywords: tokenize("return refund exchange cancel cancellation send back money"),
      answer: "You can return unopened products within 30 days of delivery for a refund. See our Returns & Refund Policy for full details.",
      link: { href: "/legal/returns-refunds", label: "Returns & Refund Policy" },
    },
    {
      id: "policy-payment",
      keywords: tokenize("payment pay card apple pay google pay klarna clearpay checkout"),
      answer: "Online payment is still being set up on the site and isn't live yet. If you'd like to place an order in the meantime, please contact us.",
      link: { href: "/contact", label: "Contact us" },
    },
    {
      id: "policy-tracking",
      keywords: tokenize("track tracking where is my order status delivered dispatched"),
      answer: "You can track your order any time using your order number and delivery postcode.",
      link: { href: "/track-order", label: "Track your order" },
    },
    {
      id: "policy-professional",
      keywords: tokenize("professional trade salon technician bulk wholesale"),
      answer: "Our Professional range is still being finalised. Get in touch and we'll let you know as soon as it's available.",
      link: { href: "/contact", label: "Contact us" },
    },
    {
      id: "policy-ingredients",
      keywords: tokenize("ingredient ingredients contains allergy allergic safe pregnant pregnancy skin reaction"),
      answer: "Full ingredient lists are shown on each product page where they've been confirmed — please check there, or contact us if you have a specific question.",
      link: { href: "/shop", label: "Shop all products" },
    },
    {
      id: "contact",
      keywords: tokenize("contact human help support email speak talk agent"),
      answer: `You can reach our team at ${CONTACT_EMAIL} or via the contact form.`,
      link: { href: "/contact", label: "Contact us" },
    },
  );

  return entries;
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "do", "does", "how", "what", "when", "where", "why",
  "i", "you", "my", "your", "to", "of", "for", "in", "on", "and", "or", "it", "be",
  "can", "will", "with", "about", "please", "me",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}
