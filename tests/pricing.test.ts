import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { calculateOrderTotals } from "@/lib/checkout/pricing";
import { resetDb, seedMinimalCatalog } from "./helpers/db";

describe("pricing", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("resolves price from the database, not from anything the client sends — CartLineInput has no price field at all", async () => {
    const { activeProduct } = await seedMinimalCatalog();

    const totals = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
    });

    expect(totals.lines[0].unitPriceInPence).toBe(2000);

    // Change the real price and confirm a fresh call reflects it — proves
    // this is live-resolved from the DB every call, not cached anywhere.
    await prisma.product.update({ where: { id: activeProduct.id }, data: { priceInPence: 3300 } });
    const totalsAfter = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
    });
    expect(totalsAfter.lines[0].unitPriceInPence).toBe(3300);
  });

  it("applies an active sale price, and only within its scheduled window", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    const variant = activeProduct.variants[0];
    const now = new Date();
    const past = new Date(now.getTime() - 1000 * 60 * 60 * 24);
    const future = new Date(now.getTime() + 1000 * 60 * 60 * 24);

    await prisma.variant.update({
      where: { id: variant.id },
      data: { salePriceInPence: 1200, saleStartsAt: past, saleEndsAt: future },
    });
    const duringSale = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
    });
    expect(duringSale.lines[0].unitPriceInPence).toBe(1200);

    await prisma.variant.update({
      where: { id: variant.id },
      data: { saleStartsAt: new Date(past.getTime() - 1000), saleEndsAt: past },
    });
    const afterSale = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
    });
    expect(afterSale.lines[0].unitPriceInPence).toBe(2000);
  });

  it("multiplies unit price by quantity for the line total and sums lines for the subtotal", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    await prisma.variant.update({ where: { id: activeProduct.variants[0].id }, data: { stockQuantity: 10 } });

    const totals = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 4 }],
      shippingMethodId: "standard",
    });

    expect(totals.lines[0].lineTotalInPence).toBe(2000 * 4);
    expect(totals.subtotalInPence).toBe(2000 * 4);
  });

  it("applies a valid promo code's discount and ignores an invalid one", async () => {
    const { activeProduct } = await seedMinimalCatalog();

    const withValidCode = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      promoCode: "GLOW10",
    });
    expect(withValidCode.discountInPence).toBe(200); // 10% of 2000

    const withInvalidCode = await calculateOrderTotals({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      promoCode: "NOT-A-REAL-CODE",
    });
    expect(withInvalidCode.discountInPence).toBe(0);
    expect(withInvalidCode.errors.length).toBeGreaterThan(0);
  });
});
