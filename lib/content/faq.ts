import type { FaqItem, FaqSection } from "@/types";
import { SHIPPING_METHODS } from "@/lib/shipping/methods";
import { FREE_DELIVERY_THRESHOLD_PENCE } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";

/**
 * Only confirmed product/store facts belong here — no invented cosmetic,
 * dietary, or ethical claims (vegan/cruelty-free/organic/etc.) unless
 * supplied and confirmed by the client. General self-tanning technique
 * questions (application, aftercare, removal) draw on widely-corroborated
 * industry-standard practice, not brand-specific claims, and are written
 * fresh rather than quoted from any source.
 *
 * Deliberately organised into a handful of substantial sections rather
 * than dozens of thin one-off pages — per Google's own generative-AI
 * content guidance (developers.google.com/search/docs/fundamentals/
 * ai-optimization-guide), fragmenting content into many near-duplicate
 * pieces risks landing in "scaled content abuse" territory instead of
 * helping.
 */
export const faqSections: FaqSection[] = [
  {
    title: "Applying your tan",
    items: [
      {
        question: "Why does my self-tan turn out streaky?",
        answer:
          "Streaks are almost always down to uneven layering or applying to skin that isn't completely dry. Use a mitt for even coverage, work in long, sweeping strokes, and blend outward at the wrists, ankles and hairline, where product tends to build up.",
      },
      {
        question: "Do I need to exfoliate before applying?",
        answer:
          "Yes — dead skin cells are the main cause of patchy, fast-fading tan. Exfoliate before application and complete any hair removal approximately 24 hours beforehand, then apply to clean, dry skin. Full preparation steps are on each product page.",
      },
      {
        question: "Should I shave or wax before or after tanning?",
        answer:
          "Before, and ideally at least 24 hours beforehand. Shaving immediately before applying tan can leave pores open, which causes small dark dots or uneven colour where product settles into them.",
      },
      {
        question: "How do I avoid orange palms and stained hands?",
        answer:
          "Always apply with a mitt rather than bare hands. If you do get product on your hands, wash them with soap straight away — tan takes longer to develop on hands than on the rest of the body, so a quick wash usually removes most of it before it sets.",
      },
      {
        question: "Can I moisturise before applying tan?",
        answer:
          "Only lightly, and only on the driest areas — elbows, knees and ankles — with an oil-free moisturiser, since dry skin absorbs tan faster and can go darker there. Anywhere else, apply to clean, product-free skin; a heavier lotion can act as a barrier and cause patchiness.",
      },
      {
        question: "How long should I wait before showering after applying?",
        answer:
          "This depends on the product's development time — check the directions on the product page. As a general rule, avoid water, sweat and tight clothing for the full development window so the colour can set evenly.",
      },
      {
        question: "What should I wear while my tan develops?",
        answer: "Loose, dark, breathable clothing. Tight or light-coloured fabric can rub product off before it's fully developed and may pick up colour transfer.",
      },
      {
        question: "Can I apply a second coat for deeper colour?",
        answer:
          "With a buildable formula, yes — once the first coat has fully developed, a second layer can add depth. Check the individual product's directions to confirm it's designed to be layered.",
      },
    ],
  },
  {
    title: "After your tan develops",
    items: [
      {
        question: "How do I make my tan last longer?",
        answer:
          "Moisturise daily with a hydrating, oil-free lotion, pat skin dry rather than rubbing it after washing, and avoid long hot showers, baths, swimming pools and heavy exfoliation while you want the colour to stay.",
      },
      {
        question: "Why is my tan fading unevenly after a few days?",
        answer:
          "Skin renews itself faster in some areas than others — hands, feet, elbows and knees typically fade first. Regular gentle moisturising slows this down and helps colour fade more evenly until you're ready to exfoliate and reapply.",
      },
      {
        question: "How do I remove my self-tan if I want to start fresh?",
        answer:
          "A warm bath or shower to soften the skin, followed by an exfoliating mitt or scrub worked in circular motions, will lift most of it. For stubborn patches, a baking-soda paste left on for a few minutes before rinsing can help. Moisturise well afterwards.",
      },
      {
        question: "Can I remove tan quickly if I have an event coming up?",
        answer:
          "If it's still fresh (within a few hours of applying and before it's fully developed), washing with warm soapy water can reduce it significantly. Once it's fully developed, plan on one or two proper exfoliation sessions rather than expecting an instant fix.",
      },
      {
        question: "Is it normal for self-tan to have a scent?",
        answer:
          "Most self-tanning products contain DHA, the ingredient that reacts with skin to produce colour, and this reaction has a characteristic scent while it develops that fades once the tan has matured and been washed over a few times. Check individual product pages for fragrance notes.",
      },
      {
        question: "Can I swim or exercise once my tan has developed?",
        answer:
          "Once fully developed, yes, but chlorine, salt water and heavy sweating will all speed up fading, so it's worth timing swims or workouts for later in your tan's life if you want it to last as long as possible.",
      },
    ],
  },
  {
    title: "Choosing the right product",
    items: [
      {
        question: "What's the difference between tanning mousse and tanning mist?",
        answer:
          "Mousse is buildable, so you can layer it for a deeper, more natural glow, while mist is fine and fast-drying, making it better suited to quick, even top-ups. See our Mousse and Mist categories for the full range of each.",
      },
      {
        question: "What are tanning drops and how do I use them?",
        answer:
          "Tanning drops are mixed into your own moisturiser rather than applied on their own, which lets you control the depth of colour drop by drop — a good option if you want a gradual, customisable tan rather than an instant one.",
      },
      {
        question: "I'm new to self-tan — where should I start?",
        answer:
          "If you'd rather build colour up gradually, tanning drops mixed into your regular moisturiser are the most forgiving place to start. If you want more depth from a single application, a buildable mousse is a good next step — just patch-test first if you're unsure how your skin will react.",
      },
      {
        question: "How do I choose a product if I have sensitive skin?",
        answer:
          "Check the ingredients list on each product page before buying, and patch-test a small area 24–48 hours before full application if you have sensitive or reactive skin, or a known allergy.",
      },
      {
        question: "What's a tan primer or preparation product for?",
        answer:
          "Preparation products — exfoliants and primers — are designed to be used before your tan, to remove dead skin cells and even out the surface so your tan applies and develops more evenly. See our Preparation category.",
      },
      {
        question: "How is a tan-removal product different from normal exfoliation?",
        answer:
          "Tan-removal products are formulated specifically to lift and break down existing tan pigment, so they typically work faster and more targeted on tanned skin than a standard body scrub. See our Tan Removal category.",
      },
    ],
  },
  {
    title: "Orders, delivery & support",
    items: [
      {
        question: "Do you deliver across the UK?",
        answer:
          "Yes, we deliver across the UK, with international shipping planned. Royal Mail is our primary carrier; see our Delivery Information page for current rates and timings.",
      },
      {
        question: "What delivery options do you offer?",
        answer:
          `${SHIPPING_METHODS.map((m) => `${m.label} (${m.etaLabel}, ${formatPrice(m.basePriceInPence)})`).join(" and ")}. Standard delivery is free once your order reaches ${formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)}.`,
      },
      {
        question: "How do I track my order?",
        answer: "Use the Track Your Order page with your order number and postcode, or check My Account if you have one.",
      },
      {
        question: "Can I change or cancel my order after placing it?",
        answer:
          "Get in touch as soon as possible — orders can move to fulfilment quickly. See our Cancellation Policy for what's possible depending on your order's status.",
      },
      {
        question: "What if I'm not happy with my order?",
        answer: "You can request a cancellation or refund on your order — see our Returns & Refund Policy for details.",
      },
      {
        question: "Where can I see a product's full ingredient list?",
        answer:
          "Ingredients are listed on each product page where they've been confirmed. If a product doesn't show an ingredient list yet, it's still being finalised and isn't available to buy.",
      },
    ],
  },
];

export const faqItems: FaqItem[] = faqSections.flatMap((section) => section.items);
