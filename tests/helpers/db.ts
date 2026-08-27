import { prisma } from "@/lib/db/prisma";

const TABLES = [
  '"OrderTrackingEvent"',
  '"OrderItem"',
  '"Order"',
  '"Address"',
  '"session"',
  '"account"',
  '"verification"',
  '"user"',
  '"NewsletterSubscriber"',
  '"StockMovement"',
  '"Variant"',
  '"ProductImage"',
  '"Product"',
  '"Category"',
];

export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${TABLES.join(", ")} CASCADE`);
}

/** A minimal, valid category + one ACTIVE product (with stock) + one DRAFT product, for tests that need real catalog data to check out against. */
export async function seedMinimalCatalog() {
  const category = await prisma.category.create({
    data: { slug: "test-category", name: "Test Category" },
  });

  const activeProduct = await prisma.product.create({
    data: {
      slug: "test-active-product",
      name: "Test Active Product",
      categoryId: category.id,
      priceInPence: 2000,
      status: "ACTIVE",
      contentVerified: true,
      variants: {
        create: [{ sku: "TEST-ACTIVE-1", stockQuantity: 5, active: true }],
      },
    },
    include: { variants: true },
  });

  const draftProduct = await prisma.product.create({
    data: {
      slug: "test-draft-product",
      name: "Test Draft Product",
      categoryId: category.id,
      priceInPence: 1500,
      status: "DRAFT",
      variants: {
        create: [{ sku: "TEST-DRAFT-1", stockQuantity: 5, active: true }],
      },
    },
    include: { variants: true },
  });

  return { category, activeProduct, draftProduct };
}
