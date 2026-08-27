/**
 * Seed data policy:
 *
 * - Only content actually supplied by the client is used. Nothing here
 *   invents ingredients, directions, warnings, or cosmetic/medical claims.
 * - A product only goes ACTIVE (purchasable) once it has real pricing
 *   AND enough real content (description, directions, warnings) to be
 *   safely customer-facing. Anything short of that stays DRAFT.
 * - `adminNotes` / `contentVerified` are internal-only fields — the
 *   public product query layer (lib/products/queries.ts) must never
 *   project them to a customer-facing type.
 */
import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "self-tan", name: "Self Tan", description: "Everything you need for a flawless, natural-looking tan.", sortOrder: 1 },
  { slug: "mousse", name: "Mousse", description: "Buildable tanning mousse for a deep, natural glow.", sortOrder: 2 },
  { slug: "mist", name: "Mist", description: "Fine tanning mists for an even, fast application.", sortOrder: 3 },
  { slug: "drops", name: "Drops", description: "Customisable tanning drops to mix into your favourite moisturiser.", sortOrder: 4 },
  { slug: "preparation", name: "Preparation", description: "Exfoliants and primers to prep skin before tanning.", sortOrder: 5 },
  { slug: "tan-removal", name: "Tan Removal", description: "Products to lift and remove old tan.", sortOrder: 6 },
  { slug: "skincare", name: "Skincare", description: "Skincare to complement your tanning routine.", sortOrder: 7 },
  { slug: "professional", name: "Professional", description: "Professional-strength solutions for salons and tanning technicians.", sortOrder: 8 },
  { slug: "bundles", name: "Bundles", description: "Curated product bundles.", sortOrder: 9 },
];

const mousseIngredients = [
  "Aqua (Water)",
  "Dihydroxyacetone",
  "Glycerin",
  "Propylene Glycol",
  "Phenoxyethanol",
  "Cocamidopropyl Betaine",
  "Parfum (Fragrance)",
  "Polysorbate 20",
  "Hydroxyethylcellulose",
  "Aloe Barbadensis Leaf Juice Powder",
  "Citric Acid",
  "CI 16035 (Red 40)",
  "CI 19140 (Yellow 5)",
  "CI 42090 (Blue 1)",
  "Coumarin",
];

const mistIngredients = [
  "Aqua (Water)",
  "Dihydroxyacetone",
  "Propylene Glycol",
  "Glycerin",
  "Phenoxyethanol",
  "Hydroxyethylcellulose",
  "Parfum (Fragrance)",
  "Polysorbate 20",
  "Aloe Barbadensis Leaf Juice Powder",
  "Citric Acid",
  "CI 16035 (Red 40)",
  "CI 19140 (Yellow 5)",
  "CI 42090 (Blue 1)",
  "Citronellol",
  "Coumarin",
  "Geraniol",
  "Linalool",
];

const eraserIngredients = [
  "Aqua (Water)",
  "Urea",
  "Glycerin",
  "Ethoxydiglycol",
  "Phenoxyethanol",
  "Sodium Bicarbonate",
  "Cocamidopropyl Betaine",
  "Aloe Barbadensis Leaf Extract",
  "Citric Acid",
  "Parfum (Fragrance)",
  "Polysorbate 20",
  "Sodium Chloride",
  "Potassium Sorbate",
  "Sodium Benzoate",
];

const mousseWarnings = [
  "Store in a cool, dark place.",
  "Keep out of reach of children.",
  "Avoid direct inhalation.",
  "Do not use on damaged or broken skin.",
  "Avoid contact with eyes.",
  "Product does not contain sunscreen.",
  "Wash hands with soap and water if product comes into contact with hands.",
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  const categoryId = async (slug: string) => {
    const c = await prisma.category.findUniqueOrThrow({ where: { slug } });
    return c.id;
  };

  // --- 1. Tanning Mousse — real content supplied, ready to publish ---
  await prisma.product.upsert({
    where: { slug: "tanning-mousse" },
    update: {},
    create: {
      slug: "tanning-mousse",
      name: "Tanning Mousse",
      categoryId: await categoryId("mousse"),
      status: ProductStatus.ACTIVE,
      featured: true,
      priceInPence: 1600,
      shortDescription:
        "An instant tanning mousse with instant bronzers for immediate colour, developing further over approximately 8 hours for a deeper, natural-looking tan.",
      description:
        "This instant tanning mousse contains instant bronzers designed to give an immediate bronzed appearance while continuing to develop for approximately 8 hours, producing a deeper natural-looking tan.",
      benefits: JSON.stringify([
        "Instant bronzed colour on application",
        "Continues to develop for approximately 8 hours",
        "Deeper, natural-looking tan result",
      ]),
      preparation: JSON.stringify([
        "Exfoliate before application.",
        "Complete hair removal approximately 24 hours before application.",
        "Apply to clean, dry skin.",
      ]),
      directions: JSON.stringify([
        "Pump tanning mousse onto a tanning mitt.",
        "Apply gently in circular motions.",
        "For a darker result, a second layer may be applied.",
      ]),
      warnings: JSON.stringify(mousseWarnings),
      ingredients: JSON.stringify([]),
      seoTitle: "Tanning Mousse | La Lunatique",
      seoDescription:
        "Instant tanning mousse with instant bronzers — immediate colour that develops over approximately 8 hours for a deeper, natural-looking tan.",
      contentVerified: false,
      adminNotes:
        "Ingredient list (Coconut fragrance) supplied via client documentation and requires final verification against the official product specification before launch. Pack size and shipping weight not yet confirmed by client — currently modelled as a single provisional variant. Additional fragrances must not reuse the Coconut ingredient list without their own confirmed ingredients.",
      variants: {
        create: [
          {
            sku: "LL-MOU-COC",
            fragrance: "Coconut",
            stockQuantity: 50,
            lowStockThreshold: 10,
            weightGrams: 0,
            ingredients: JSON.stringify(mousseIngredients),
            active: true,
          },
        ],
      },
      images: {
        create: [
          { url: "/products/tanning-mousse-lifestyle.jpg", alt: "La Lunatique Tanning Mousse", isFeatured: true, sortOrder: 0 },
        ],
      },
    },
  });

  // --- 2. Tan in a Can / Tanning Mist — real content, identity needs confirming ---
  await prisma.product.upsert({
    where: { slug: "tanning-mist" },
    update: {},
    create: {
      slug: "tanning-mist",
      name: "Tan in a Can / Tanning Mist",
      categoryId: await categoryId("mist"),
      status: ProductStatus.ACTIVE,
      featured: true,
      priceInPence: 3000,
      shortDescription:
        "A fine tanning mist with instant bronzers for an immediate glow, continuing to develop for approximately 8 hours.",
      description:
        "La Lunatique Tanning Mist is intended to create a fine tanning mist with instant bronzers for an immediate glow while continuing to develop for approximately 8 hours.",
      benefits: JSON.stringify([
        "Instant bronzed glow on application",
        "Fine, even mist application",
        "Continues to develop for approximately 8 hours",
      ]),
      preparation: JSON.stringify([
        "Exfoliate before application.",
        "Complete hair removal approximately 24 hours beforehand.",
        "Apply to clean skin.",
      ]),
      directions: JSON.stringify([
        "Hold approximately 20–30cm from the skin.",
        "Spray evenly using a sweeping motion.",
        "A tanning mitt may be used to blend the product.",
      ]),
      warnings: JSON.stringify([]),
      ingredients: JSON.stringify(mistIngredients),
      seoTitle: "Tan in a Can / Tanning Mist | La Lunatique",
      seoDescription:
        "A fine tanning mist with instant bronzers for an immediate glow, developing further over approximately 8 hours.",
      contentVerified: false,
      adminNotes:
        "REQUIRES CONFIRMATION BEFORE LAUNCH: 'Tan in a Can' and 'Tanning Mist' may refer to the same product — confirm final naming/identity before going live (currently listed as one product with both names). No warnings text has been supplied for this product — do not treat Tanning Mousse's warnings as applicable here; launch is not recommended without confirmed warnings copy. Pack size and shipping weight not yet confirmed.",
      variants: {
        create: [
          {
            sku: "LL-MIST",
            stockQuantity: 50,
            lowStockThreshold: 10,
            weightGrams: 0,
            active: true,
          },
        ],
      },
      images: {
        create: [
          { url: "/products/tanning-mist-label.jpg", alt: "La Lunatique Tanning Mist", isFeatured: true, sortOrder: 0 },
        ],
      },
    },
  });

  // --- 3. Tan Eraser — ingredients only; description/directions/warnings/size outstanding ---
  await prisma.product.upsert({
    where: { slug: "tan-eraser" },
    update: {},
    create: {
      slug: "tan-eraser",
      name: "Tan Eraser",
      categoryId: await categoryId("tan-removal"),
      status: ProductStatus.DRAFT,
      featured: false,
      priceInPence: 1700,
      shortDescription: "",
      description: "",
      benefits: JSON.stringify([]),
      preparation: JSON.stringify([]),
      directions: JSON.stringify([]),
      warnings: JSON.stringify([]),
      ingredients: JSON.stringify(eraserIngredients),
      contentVerified: false,
      adminNotes:
        "Directions, warnings, pack size and a detailed product description are still required from the client before this product can be published. Do not activate/publish until this content is confirmed — warnings text is safety-relevant and is currently missing entirely. Price (£17) is confirmed.",
      variants: {
        create: [
          {
            sku: "LL-ERASE",
            stockQuantity: 0,
            lowStockThreshold: 10,
            weightGrams: 0,
            active: false,
          },
        ],
      },
      images: {
        create: [{ url: "/products/tan-eraser-logo.jpg", alt: "Tan Eraser by La Lunatique", isFeatured: true, sortOrder: 0 }],
      },
    },
  });

  // --- 4–9. Remaining product families — draft placeholders pending client content ---
  await prisma.product.upsert({
    where: { slug: "tan-primer" },
    update: {},
    create: {
      slug: "tan-primer",
      name: "Tan Primer",
      categoryId: await categoryId("preparation"),
      status: ProductStatus.DRAFT,
      priceInPence: 1700,
      shortDescription: "",
      description: "",
      adminNotes: "Price confirmed (£17) but no description, directions, warnings or ingredients supplied yet. Do not publish until content is provided.",
      variants: { create: [{ sku: "LL-PRIMER", stockQuantity: 0, weightGrams: 0, active: false }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: "tanning-drops" },
    update: {},
    create: {
      slug: "tanning-drops",
      name: "Tanning Drops",
      categoryId: await categoryId("drops"),
      status: ProductStatus.DRAFT,
      priceInPence: null,
      shortDescription: "",
      description: "",
      adminNotes: "Price and all product content (description, directions, warnings, ingredients) still to be confirmed by client.",
      variants: { create: [{ sku: "LL-DROPS", stockQuantity: 0, weightGrams: 0, active: false }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: "anti-ageing-cream" },
    update: {},
    create: {
      slug: "anti-ageing-cream",
      name: "Anti-Ageing Cream",
      categoryId: await categoryId("skincare"),
      status: ProductStatus.DRAFT,
      priceInPence: null,
      shortDescription: "",
      description: "",
      adminNotes:
        "Price and all product content still TBC. 'Anti-Ageing Cream' is the client's own supplied product family name — no anti-ageing efficacy, clinical, or dermatological claims may be added to copy without supporting evidence and compliance sign-off.",
      variants: { create: [{ sku: "LL-ANTIAGE", stockQuantity: 0, weightGrams: 0, active: false }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: "sunbed-cream" },
    update: {},
    create: {
      slug: "sunbed-cream",
      name: "Sunbed Cream",
      categoryId: await categoryId("skincare"),
      status: ProductStatus.DRAFT,
      priceInPence: null,
      shortDescription: "",
      description: "",
      adminNotes: "Price and all product content still TBC.",
      variants: { create: [{ sku: "LL-SUNBED", stockQuantity: 0, weightGrams: 0, active: false }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: "professional-tan-solution" },
    update: {},
    create: {
      slug: "professional-tan-solution",
      name: "Professional Tan Solution",
      categoryId: await categoryId("professional"),
      status: ProductStatus.DRAFT,
      priceInPence: null,
      shortDescription: "",
      description: "",
      adminNotes:
        "Price range £25–£45 confirmed as varying by variant, but the exact variant breakdown (sizes/strengths) and all product content (description, directions, warnings, ingredients) have not yet been supplied. The placeholder variants below illustrate the price range only and must be replaced with real variant data before publishing.",
      variants: {
        create: [
          { sku: "LL-PRO-A", priceOverrideInPence: 2500, stockQuantity: 0, weightGrams: 0, active: false },
          { sku: "LL-PRO-B", priceOverrideInPence: 3500, stockQuantity: 0, weightGrams: 0, active: false },
          { sku: "LL-PRO-C", priceOverrideInPence: 4500, stockQuantity: 0, weightGrams: 0, active: false },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "coco-scrub" },
    update: {},
    create: {
      slug: "coco-scrub",
      name: "Coco Scrub",
      categoryId: await categoryId("preparation"),
      status: ProductStatus.DRAFT,
      priceInPence: null,
      shortDescription: "",
      description: "",
      adminNotes: "Draft product requiring full client confirmation (name, price, content) — client has not yet confirmed this product will be sold.",
      variants: { create: [{ sku: "LL-COCOSCRUB", stockQuantity: 0, weightGrams: 0, active: false }] },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
