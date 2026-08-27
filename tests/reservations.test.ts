import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  createReservations,
  releaseReservationsForAttempt,
  consumeReservationsForAttempt,
  InsufficientStockError,
} from "@/lib/products/inventory";
import { availableStock } from "@/lib/products/inventory";
import { releaseExpiredReservations } from "@/lib/payments/reservation-cleanup";
import { resetDb, seedMinimalCatalog } from "./helpers/db";

async function makeAttempt(overrides: Partial<{ status: "PENDING" | "COMPLETED" | "EXPIRED" | "FAILED" | "CANCELED"; expiresAt: Date }> = {}) {
  return prisma.checkoutAttempt.create({
    data: {
      idempotencyKey: `key-${Math.random().toString(36).slice(2)}`,
      email: "reservation-test@example.com",
      shippingName: "Reservation Test",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "E1 6AN",
      shippingCountry: "United Kingdom",
      shippingMethodId: "standard",
      subtotalInPence: 2000,
      discountInPence: 0,
      shippingInPence: 0,
      totalInPence: 2000,
      status: overrides.status ?? "PENDING",
      expiresAt: overrides.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000),
    },
  });
}

describe("inventory reservations", () => {
  let variantId: string;

  beforeEach(async () => {
    await resetDb();
    const { activeProduct } = await seedMinimalCatalog();
    variantId = activeProduct.variants[0].id;
    await prisma.variant.update({ where: { id: variantId }, data: { stockQuantity: 5 } });
  });

  it("reduces available stock the moment it's created, before any payment happens", async () => {
    const attempt = await makeAttempt();
    await prisma.$transaction((tx) =>
      createReservations(tx, attempt.id, [{ variantId, qty: 2 }], attempt.expiresAt),
    );

    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(availableStock(variant)).toBe(3); // 5 stock - 2 reserved
    expect(variant.stockQuantity).toBe(5); // real stock untouched
  });

  it("two competing reservations for the final unit: exactly one succeeds", async () => {
    await prisma.variant.update({ where: { id: variantId }, data: { stockQuantity: 1 } });
    const [attemptA, attemptB] = await Promise.all([makeAttempt(), makeAttempt()]);

    const results = await Promise.allSettled([
      prisma.$transaction((tx) => createReservations(tx, attemptA.id, [{ variantId, qty: 1 }], attemptA.expiresAt)),
      prisma.$transaction((tx) => createReservations(tx, attemptB.id, [{ variantId, qty: 1 }], attemptB.expiresAt)),
    ]);

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect((failed[0] as PromiseRejectedResult).reason).toBeInstanceOf(InsufficientStockError);

    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(availableStock(variant)).toBe(0);
  });

  it("releasing a reservation restores available stock, and is safe to call twice", async () => {
    const attempt = await makeAttempt();
    await prisma.$transaction((tx) => createReservations(tx, attempt.id, [{ variantId, qty: 3 }], attempt.expiresAt));
    expect(availableStock(await prisma.variant.findUniqueOrThrow({ where: { id: variantId } }))).toBe(2);

    await releaseReservationsForAttempt(attempt.id);
    expect(availableStock(await prisma.variant.findUniqueOrThrow({ where: { id: variantId } }))).toBe(5);

    // Calling it again (duplicate expiry event, etc.) must not double-release.
    await releaseReservationsForAttempt(attempt.id);
    expect(availableStock(await prisma.variant.findUniqueOrThrow({ where: { id: variantId } }))).toBe(5);
  });

  it("consuming a reservation deducts real stock exactly once, even if called twice", async () => {
    const attempt = await makeAttempt();
    await prisma.$transaction((tx) => createReservations(tx, attempt.id, [{ variantId, qty: 2 }], attempt.expiresAt));

    await prisma.$transaction((tx) => consumeReservationsForAttempt(tx, attempt.id, "test order"));
    let variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(3); // 5 - 2, permanently
    expect(variant.reservedStock).toBe(0);

    // Simulates a duplicate webhook delivery calling consume again.
    await prisma.$transaction((tx) => consumeReservationsForAttempt(tx, attempt.id, "test order"));
    variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(3); // unchanged — nothing ACTIVE left to consume
  });

  it("the expiry sweep releases only PENDING attempts past their own expiresAt", async () => {
    const expired = await makeAttempt({ expiresAt: new Date(Date.now() - 1000) });
    const stillLive = await makeAttempt({ expiresAt: new Date(Date.now() + 1000 * 60) });
    await prisma.$transaction((tx) => createReservations(tx, expired.id, [{ variantId, qty: 1 }], expired.expiresAt));
    await prisma.$transaction((tx) => createReservations(tx, stillLive.id, [{ variantId, qty: 1 }], stillLive.expiresAt));

    const result = await releaseExpiredReservations();
    expect(result.releasedAttempts).toBe(1);

    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(availableStock(variant)).toBe(4); // 5 - 1 (still-live reservation only; the expired one was released)

    const refreshedExpired = await prisma.checkoutAttempt.findUniqueOrThrow({ where: { id: expired.id } });
    expect(refreshedExpired.status).toBe("EXPIRED");
    const refreshedLive = await prisma.checkoutAttempt.findUniqueOrThrow({ where: { id: stillLive.id } });
    expect(refreshedLive.status).toBe("PENDING");
  });
});
