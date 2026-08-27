import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { calculateOrderTotals } from "@/lib/checkout/pricing";
import { getProductBySlug } from "@/lib/products/queries";
import { resetDb, seedMinimalCatalog } from "./helpers/db";

describe("draft products and unavailable variants", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("a DRAFT product is invisible to the public product query", async () => {
    const { draftProduct } = await seedMinimalCatalog();
    const found = await getProductBySlug(draftProduct.slug);
    expect(found).toBeUndefined();
  });

  it("checkout rejects a DRAFT product's variant — it never becomes a purchasable line", async () => {
    const { draftProduct } = await seedMinimalCatalog();

    const totals = await calculateOrderTotals({
      lines: [{ slug: draftProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
    });

    expect(totals.lines).toHaveLength(0);
    expect(totals.errors.length).toBeGreaterThan(0);
  });

  it("a sold-out variant (0 stock) is dropped from checkout with an explanatory error, not silently allowed", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    await prisma.variant.update({ where: { id: activeProduct.variants[0].id }, data: { stockQuantity: 0 } });

    const totals = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
    });

    expect(totals.lines).toHaveLength(0);
    expect(totals.errors.some((e) => e.includes("sold out"))).toBe(true);
  });

  it("requesting more than available stock is clamped to what's actually in stock, not rejected outright", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    await prisma.variant.update({ where: { id: activeProduct.variants[0].id }, data: { stockQuantity: 2 } });

    const totals = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 5 }],
      shippingMethodId: "standard",
    });

    expect(totals.lines[0].qty).toBe(2);
    expect(totals.errors.length).toBeGreaterThan(0);
  });
});
