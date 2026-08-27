import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { adjustStock, commitOrderStock, InsufficientStockError } from "@/lib/products/inventory";
import { resetDb, seedMinimalCatalog } from "./helpers/db";

describe("inventory", () => {
  let variantId: string;
  let otherVariantId: string;

  beforeEach(async () => {
    await resetDb();
    const { activeProduct } = await seedMinimalCatalog();
    variantId = activeProduct.variants[0].id;
    const other = await prisma.variant.create({
      data: { productId: activeProduct.id, sku: "TEST-ACTIVE-2", stockQuantity: 5, active: true },
    });
    otherVariantId = other.id;
  });

  it("rejects deducting more than is available and leaves stock unchanged", async () => {
    await expect(
      commitOrderStock([{ variantId, qty: 999 }], "test order"),
    ).rejects.toThrow(InsufficientStockError);

    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(5); // unchanged — the transaction rolled back
  });

  it("never leaves stock negative even via adjustStock", async () => {
    await expect(adjustStock(variantId, -100, "MANUAL_ADJUSTMENT")).rejects.toThrow();
    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBeGreaterThanOrEqual(0);
  });

  it("deducting stock for one variant never touches a different variant", async () => {
    await commitOrderStock([{ variantId, qty: 2 }], "test order");

    const target = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    const other = await prisma.variant.findUniqueOrThrow({ where: { id: otherVariantId } });
    expect(target.stockQuantity).toBe(3);
    expect(other.stockQuantity).toBe(5); // untouched
  });

  it("two simultaneous checkouts racing for the last unit: exactly one succeeds, stock never goes negative", async () => {
    await prisma.variant.update({ where: { id: variantId }, data: { stockQuantity: 1 } });

    const results = await Promise.allSettled([
      commitOrderStock([{ variantId, qty: 1 }], "racer A"),
      commitOrderStock([{ variantId, qty: 1 }], "racer B"),
    ]);

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);

    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(0);
  });
});
