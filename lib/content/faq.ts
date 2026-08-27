import type { FaqItem } from "@/types";

/**
 * Only confirmed product/store facts belong here — no invented cosmetic,
 * dietary, or ethical claims (vegan/cruelty-free/organic/etc.) unless
 * supplied and confirmed by the client.
 */
export const faqItems: FaqItem[] = [
  {
    question: "How long does La Lunatique tan take to develop?",
    answer:
      "Our Tanning Mousse and Tan in a Can / Tanning Mist both give an instant bronzed colour on application, which continues to develop for approximately 8 hours. Check each product page for full directions.",
  },
  {
    question: "How should I prepare before applying?",
    answer:
      "Exfoliate before application and complete any hair removal approximately 24 hours beforehand, then apply to clean, dry skin. Full preparation steps are on each product page.",
  },
  {
    question: "What if I'm not happy with my order?",
    answer: "You can request a cancellation or refund on your order — see our Returns & Refund Policy for details.",
  },
  {
    question: "Do you deliver across the UK?",
    answer:
      "Yes, we deliver across the UK, with international shipping planned. Royal Mail is our primary carrier; see our Delivery Information page for current rates and timings.",
  },
  {
    question: "How do I track my order?",
    answer: "Use the Track Your Order page with your order number and postcode, or check My Account if you have one.",
  },
  {
    question: "Where can I see a product's full ingredient list?",
    answer:
      "Ingredients are listed on each product page where they've been confirmed. If a product doesn't show an ingredient list yet, it's still being finalised and isn't available to buy.",
  },
];
